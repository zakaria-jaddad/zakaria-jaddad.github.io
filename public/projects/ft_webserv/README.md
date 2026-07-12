## The client Server Model

Most inter-process uses the **client** **server** model. These terms refer to two processes which will be communicating with each other.

One of the two processes the client connects to the other process the server.

Typically to make a request for information A good analogy is a person who makes a phone call to another person.

The client is a program that crafts and send a request then receive a response, While The server a program that receives request does some work to compute, craft a response and send it.

Notice once the connection is established, both sides can send and receive information.

The system calls for establishing a connection are somewhat different for the client and the server, but bot involve the basic construct of a socket.

A socket is one end of an inter process communication channel.

When a socket is created, the program has to specify the _address domain_ and the _socket type_.o

Two processes can communicate with each other only if their sockets are only of the same _type_ and in the same _domain_

### Socket Domains

socket domains also called address famillies are abstractions that group sockets with common communication properties. The define the set of protocols and the structure used to interpret socket names, ensuring that sockets only communicate with other socket within the same domain.

There are two widely used addresses domains

- **Unix domain AF_UNIX :** in which two processes which share a common file system communicate with each other.
  - Socket address on the _unix domain_ is a character string which is basically an entry in the file system.
- **Internet domain AF_INET :** two processes each running on any two hosts on the internet communicate, each of these has it own address format.
  - Socket address on the internet are represented as `host ip address + port number`

### Socket Types

There are several types of sockets, but two are widely used.

- **Stream Sockets SOCK_STREAM :** These provide reliable connection-oriented communication using _TCP_ protocol.
- **Datagram Sockets SOCK_DGRAM :** These offer connection less, unreliable communication using _UDP_ protocol.

### Server Side Sockets

The Steps involved in establishing a socket on the server side are as follows:

1. Create a socket with the socket() system call
2. Bind the socket to an address using the bind() system call. For a server socket on the Internet, an address consists of a port number on the host machine.
3. Listen for connections with the listen() system call
4. Accept a connection with the accept() system call. This call typically blocks until a client connects with the server.
5. Send and receive data

But in our Server There are couple of changes are done.

<!-- ![server socket life cycle](./__media__/server-socket-life-cycle.png) -->

### `epoll`

`epoll` is a scalable I/O event notification mechanism in the Linux kernel designed to monitor multiple file descriptors for I/O readiness.

it replaces older POSIX calls like `select` and `poll` by operating in `O(1)` time rather than `O(n)`, making it significantly more efficient for applications managing thousands of connections.

Three Core APIs:

- `epoll_create1()`: creates the instance
- `epoll_ctl()`: adds, modifies, or removes file descriptors from the interest list using flags like EPOLL_CTL_ADD
- `epoll_wait()`: blocks until events occur, returning only the ready descriptors.

#### `epoll` Solution

With `select()` and `poll()` every call requires:

1. The user passes the entire set of file descriptors to the kernel.
2. The kernel scans all descriptors to check readiness `O(n)`
3. The kernel returns information about every descriptor passed in.
4. The user scans the result to find which ones are actually ready.

This means with 10,000 idle connections, each poll() call wastes time checking 9,999 descriptors that have nothing happening.

`epoll` is subscription-based: you register your interest once using `epoll_ctl` , and the kernel remembers it.

The kernel maintains an internal "interest list" and a "ready list." When I/O activity occurs, the kernel adds the descriptor to the ready list immediately no scanning needed.

When `epoll_wait()` is called , the kernel simply returns what's already in the ready list

#### How `epoll` Works internally

`epoll` creates an in kernel `epoll` instance and object with two lists

1. **Interest list:** All file descriptors that registered to watch.
2. **Ready list:** Reference to descriptors that are currently ready for I/O.

The `epoll` instance uses `Red black three` internally to track and monitor file descriptors for efficient _insertion_, _deletion_ and _lookup_.

#### `epoll` API

As i mentioned before there are 3 system calls:

1. `epoll_create1()`: Create an epoll instance

```c++
#include <sys/epoll.h>

int epoll_create1(int flags);
```

Returns a file descriptor referring to the new `epoll` instance.

We used `epoll_create1(int flags)` over `epoll_create(int size)` since the internal struct is dynamically resized the `size` has no use and `epoll_creat(int size)` is deprecated.

2. `epoll_ctl()` — Add/Modify/Remove file descriptors

```c++
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

in our project `epoll_ctl` will play a critical role for fd manipulation.

`epoll_ctl` accept 4 parameters:

1. `epfd`: The `epoll` instance fd.
2. `op`: Which is a macro representing one of the 3 operations
   1. `EPOLL_CTL_ADD`: Add fd to interest list.
   2. `EPOLL_CTL_MOD`: Modify current file event.
   3. `EPOLL_CTL_DEL`: Remove file from interest list.
3. `fd`: obviously the file descriptor.
4. `event`: Pointer to `struct epoll_event` specifying what event to watch for.

```c++
struct epoll_event {
    uint32_t     events;    /* Epoll events (bitmask) */
    epoll_data_t data;      /* User data variable */
};

typedef union epoll_data {
    void    *ptr;
    int      fd;
    uint32_t u32;
    uint64_t u64;
} epoll_data_t;
```

- `events`: an unsigned integer representing the `epoll` event that we care of. In our program we used only two events:
  1.  `EPOLLIN`: fd is ready for reading.
  2.  `EPOLLOUT`: fd is ready for writing.

3. `epoll_wait()` Wait for events

```c++
int epoll_wait(int epfd, struct epoll_event *events,
               int maxevents, int timeout);
```

The `epoll_wait` system call waits for I/O events on an `epoll` instance referred to by the file descriptor **epfd**. 

It blocks until a file descriptor delivers an event, the call is interrupted by a signal handler, or the specified **timeout** (in milliseconds) expires.

### Server Life cycle

## Chapter 01: Overview

The **HTTP** protocol is a request/response protocol. A client sends a
request to the server in the form of a request method, _URI_, and
protocol version, followed by a _MIME-like_ message containing request
modifiers, client information, and possible body content over a
connection with a server.

The server responds with a status line, including the message's protocol version and a success or error code, followed by a _MIME-like_ message containing server information, entity
_meta-information_, and possible entity-body content.

Because the Internet hosts many thousands of different data types, HTTP carefully tags each object being transported through the Web with a data format label called a _MIME type_. **MIME (Multipurpose Internet Mail Extensions)** was originally designed to solve problems encountered in moving messages between different electronic mail
systems.

MIME worked so well for email that HTTP adopted it to describe and label its own multimedia content.

Most URLs follow a standardized format of three main parts:

- The first part of the URL is called the scheme, and it describes the protocol used to access the resource. This is usually the HTTP protocol **(http://)**.
- The second part gives the server Internet address www.site.com
- The rest names of a resource on the web server (e.g., /specials/saw-blade.gif).

### HTTP Messages Overview

HTTP messages consist of three parts:

- Start line
  The first line of the message is the start line, indicating what to do for a request or what happened for a response.
- Header fields
  Zero or more header fields follow the start line.

  All HTTP messages begin with a start line. The start line for a request message says what to do. The start line for a response message says what happened.

  Each header field consists of a name and a value, separated by a colon (:) for easy parsing. The headers end with a blank line. Adding a header field is as easy as adding another line.

- Body
  After the blank line is an optional message body containing any kind of data.

Request bodies carry data to the web server; response bodies carry data back to the client. Unlike the start lines and headers, which are textual and structured, the body can contain arbitrary binary data (e.g., images, videos, audio tracks, software applications). Of course, the body can also contain text.

## Http Request Body

### multipart/form-data

Example of a _multipart/form-data_ http request body

```http
------WebKitFormBoundarybjzAB3z7BOFYFFSD\r
Content-Disposition: form-data; name="username"\r\n
\r\n
zakaria.jaddad@proton.me\r\n
------WebKitFormBoundarybjzAB3z7BOFYFFSD\r\n
Content-Disposition: form-data; name="password"\r\n
\r\n
hello world\r\n
------WebKitFormBoundarybjzAB3z7BOFYFFSD\r\n
Content-Disposition: form-data; name="profile"; filename="hello.txt"\r\n
Content-Type: text/plain\r\n
\r\n
hello world\r\n
\r\n
------WebKitFormBoundarybjzAB3z7BOFYFFSD\r\n
Content-Disposition: form-data; name="code"; filename="hello.txt"\r\n
Content-Type: text/plain\r\n
\r\n
hello world\r\n
\r\n
------WebKitFormBoundarybjzAB3z7BOFYFFSD--\r\n
```

When parsing an HTTP/1.1 multipart/form-data payload _defined currently in RFC 7578_, you must distinguish between the top-level HTTP headers and the part-level headers (often referred to as MIME headers) that appear immediately after each boundary delimiter.

Every time my parser encounters a boundary delimiter `(-- + the boundary string from the main HTTP Content-Type header + \r\n)`.

it enters a new part. Each part behaves like a mini-HTTP message.

To Send a Chunked Encoding Request using `curl`

```bash
curl -v -X POST \
  -H "Transfer-Encoding: chunked" \
  -H "Content-Type: image/png" \
  --upload-file /path/to/image.png \
  http://localhost:8080/upload
```

```bash
cat /path/to/image.png | curl -v -X POST \
  -H "Transfer-Encoding: chunked" \
  -H "Content-Type: image/png" \
  --data-binary @- \
  http://localhost:8080/upload
```

A server is a thing that recives request does some work to compute (craft the response) and sends it back.

Non blocking i/o in our case in web server: the server doesn't wait when the current request is reading or writing from the socket until it's ready.

- A request can be divided into CPU work and IO work.
- Servers handle request using threads, which each independently handle requests.
- Non-blocking IO allows a thread to suspend a request while it's performing IO to work on a different request.
- Non-blocking IO allows Node.js to efficiently handle IO heavy workloads with only one thread.

\*\*
