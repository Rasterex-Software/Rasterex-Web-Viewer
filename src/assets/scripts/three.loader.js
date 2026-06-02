import * as THREE from "three";
import { GLTFLoader } from "./GLTFLoader.js";
import { ViewCube } from "./ViewCube.js";
//import { BufferGeometryUtils } from './BufferGeometryUtils.js';
import * as BufferGeometryUtils from './BufferGeometryUtils.js';
//import { RoomEnvironment } from "./RoomEnvironment.js";
//import { ColorEnvironment } from "./ColorEnvironment.js";

//RoomEnvironment, ColorEnvironment
window.THREE = window.THREE || {};
Object.assign(window.THREE, THREE, { GLTFLoader, BufferGeometryUtils});
window.ViewCube = ViewCube;