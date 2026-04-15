import * as THREE from "three";
import { GLTFLoader } from "./GLTFLoader.js";
import { ViewCube } from "./ViewCube.js";

window.THREE = window.THREE || {};
Object.assign(window.THREE, THREE, { GLTFLoader });
window.ViewCube = ViewCube;