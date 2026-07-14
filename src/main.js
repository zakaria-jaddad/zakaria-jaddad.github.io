import { on, start } from "./router";
import home from "./pages/home";
import project from "./pages/project";
import "./styles/main.css";

on("/", home);
on("project/:name", project);

start();
