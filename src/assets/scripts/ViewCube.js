 import * as THREE from 'three';


    'use strict';

    var ViewCubeElement = {
        TopFace: "TopFace",
        FrontFace: "FrontFace",
        RightFace: "RightFace",
        BackFace: "BackFace",
        LeftFace: "LeftFace",
        BottomFace: "BottomFace",

        TopFrontEdge: "TopFrontEdge",
        TopRightEdge: "TopRightEdge",
        TopBackEdge: "TopBackEdge",
        TopLeftEdge: "TopLeftEdge",

        FrontRightEdge: "FrontRightEdge",
        BackRightEdge: "BackRightEdge",
        BackLeftEdge: "BackLeftEdge",
        FrontLeftEdge: "FrontLeftEdge",

        BottomFrontEdge: "BottomFrontEdge",
        BottomRightEdge: "BottomRightEdge",
        BottomBackEdge: "BottomBackEdge",
        BottomLeftEdge: "BottomLeftEdge",

        TopFrontRightCorner: "TopFrontRightCorner",
        TopBackRightCorner: "TopBackRightCorner",
        TopBackLeftCorner: "TopBackLeftCorner",
        TopFrontLeftCorner: "TopFrontLeftCorner",

        BottomFrontRightCorner: "BottomFrontRightCorner",
        BottomBackRightCorner: "BottomBackRightCorner",
        BottomBackLeftCorner: "BottomBackLeftCorner",
        BottomFrontLeftCorner: "BottomFrontLeftCorner",
    };

    var Rotation = {
        Rotate0: 0,
        Rotate90: Math.PI / 2,
        Rotate180: Math.PI,
        Rotate270: Math.PI * 1.5,
    };

    var AxisX = new THREE.Vector3(1, 0, 0);
    var AxisY = new THREE.Vector3(0, 1, 0);
    var AxisZ = new THREE.Vector3(0, 0, 1);

    var faceConfigs = [
        { name: ViewCubeElement.RightFace, text: "RIGHT", pos: [50, 0, 0], rot: [AxisY, Math.PI / 2], textRot: -Math.PI / 2 },
        { name: ViewCubeElement.LeftFace, text: "LEFT", pos: [-50, 0, 0], rot: [AxisY, -Math.PI / 2], textRot: Math.PI / 2 },
        { name: ViewCubeElement.BackFace, text: "BACK", pos: [0, 50, 0], rot: [AxisX, -Math.PI / 2], textRot: Math.PI },
        { name: ViewCubeElement.FrontFace, text: "FRONT", pos: [0, -50, 0], rot: [AxisX, Math.PI / 2], textRot: 0 },
        { name: ViewCubeElement.TopFace, text: "TOP", pos: [0, 0, 50], rot: [AxisY, 0], textRot: 0 },
        { name: ViewCubeElement.BottomFace, text: "BOTTOM", pos: [0, 0, -50], rot: [AxisX, Math.PI], textRot: Math.PI },
    ];

    function gradient(startColor, endColor, step) {
        var color1 = new THREE.Color(startColor);
        var color2 = new THREE.Color(endColor);
        return color1.lerp(color2, step).getHex();
    }

    function createTextTexture(text, backgroundColor, rotation) {
        var pixelRatio = window.devicePixelRatio || 1;
        var size = 128 * pixelRatio;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var context = canvas.getContext('2d');
        
        // Background
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, size, size);
        
        // Draw text with rotation
        context.save();
        context.translate(size / 2, size / 2);
        if (rotation) {
            context.rotate(rotation);
        }
        var fontSize = Math.round(28 * pixelRatio);
        context.font = 'bold ' + fontSize + 'px Arial';
        context.fillStyle = '#333333';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 0, 0);
        context.restore();
        
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    class Cube extends THREE.Object3D {
        constructor(cfg) {
            super();
            this.name = "ViewCube";
            this.AXIS_COLOR_X = 0xff0000;
            this.AXIS_COLOR_Y = 0x00ff00;
            this.AXIS_COLOR_Z = 0x0000ff;
            this.FACE_BACKGROUND_COLOR = 0xffffff;
            this.FACE_HOVER_BACKGROUND_COLOR = 0x31BD59;
            this.INNER_CUBE_WIDTH = 80;
            this.OUTER_CUBE_WIDTH = 100;
            this.CORNER_WIDTH = 10;
            this.AXIS_LENGTH = this.OUTER_CUBE_WIDTH * 1.3;
            this.EDGE_COLOUR = 0xd0d0d0;
            this.EDGE_OPACITY = 0.2;
            this.EDGE_SIZE = new THREE.Vector2(this.INNER_CUBE_WIDTH, this.CORNER_WIDTH);
            this.CORNER_COLOR = 0xcacbd4;
            this.CORNER_OPACITY = 1.0;
            this.faces = [];
            this.innerViewCubeMesh = undefined;
            this.showAxes = cfg && cfg.showAxes !== undefined ? cfg.showAxes : false;
            this.lineColor = cfg && cfg.lineColor !== undefined ? cfg.lineColor : 0x90a0a0;
            this.dirty = false;
            this.activateMeshName = undefined;

            this.init();
        }

        init() {
            if (this.showAxes) {
                this.add(this.createAxes());
            }
            this.add(this.createViewCubeFaces());
            this.add(this.createViewCubeEdges());
            this.add(this.createViewCubeCorners());
        }

        createAxes() {
            var v = this.OUTER_CUBE_WIDTH / 2 + 1;
            var object = new THREE.Object3D();
            var origin = new THREE.Vector3(-v, -v, -v);
            var axisX = new THREE.Vector3(1, 0, 0);
            var axisY = new THREE.Vector3(0, 1, 0);
            var axisZ = new THREE.Vector3(0, 0, 1);
            var headLength = this.AXIS_LENGTH / 15;
            var headWidth = this.AXIS_LENGTH / 20;
            var arrowX = new THREE.ArrowHelper(axisX, origin, this.AXIS_LENGTH, this.AXIS_COLOR_X, headLength, headWidth);
            var arrowY = new THREE.ArrowHelper(axisY, origin, this.AXIS_LENGTH, this.AXIS_COLOR_Y, headLength, headWidth);
            var arrowZ = new THREE.ArrowHelper(axisZ, origin, this.AXIS_LENGTH, this.AXIS_COLOR_Z, headLength, headWidth);
            object.add(arrowX, arrowY, arrowZ);
            return object;
        }

        createViewCubeFaces() {
            var object = new THREE.Object3D();
            var originalMaterials = [];
            var faceMaterial = new THREE.MeshStandardMaterial({
                color: this.FACE_BACKGROUND_COLOR,
                opacity: 0,
                transparent: true,
            });

            for (var i = 0; i < faceConfigs.length; i++) {
                var config = faceConfigs[i];
                var textTexture = createTextTexture(config.text, "#" + this.FACE_BACKGROUND_COLOR.toString(16).padStart(6, '0'), config.textRot);
                var material = new THREE.MeshBasicMaterial({
                    color: this.FACE_BACKGROUND_COLOR,
                    map: textTexture,
                    opacity: 1.0,
                    transparent: true,
                });
                originalMaterials.push(material);

                var face = this.createViewCubeFace(
                    config.name,
                    faceMaterial,
                    new THREE.Vector3().fromArray(config.pos),
                    { axis: config.rot[0], rad: config.rot[1] }
                );
                face.userData = { material: material, tick: 0, translateTick: 0 };
                this.faces.push(face);
            }
            object.add.apply(object, this.faces);

            var cube = new THREE.BoxGeometry(this.INNER_CUBE_WIDTH, this.INNER_CUBE_WIDTH, this.INNER_CUBE_WIDTH);
            var mesh = new THREE.Mesh(cube, originalMaterials);
            this.innerViewCubeMesh = mesh;
            object.add(mesh);

            var edges = new THREE.EdgesGeometry(
                new THREE.BoxGeometry(this.OUTER_CUBE_WIDTH, this.OUTER_CUBE_WIDTH, this.OUTER_CUBE_WIDTH),
            );
            var edgeMaterial = new THREE.MeshBasicMaterial({ color: this.lineColor });
            var outline = new THREE.LineSegments(edges, edgeMaterial);
            object.add(outline);
            object.position.set(0, 0, 0);
            return object;
        }

        createViewCubeFace(name, material, position, rotation) {
            var geom = new THREE.PlaneGeometry(this.INNER_CUBE_WIDTH, this.INNER_CUBE_WIDTH);
            var mesh = new THREE.Mesh(geom, material);
            mesh.name = name;
            mesh.rotateOnAxis(rotation.axis, rotation.rad);
            mesh.position.copy(position);
            return mesh;
        }

        createViewCubeEdges() {
            var object = new THREE.Object3D();
            var h = (this.INNER_CUBE_WIDTH + this.OUTER_CUBE_WIDTH) / 4; // 45
            var w = this.INNER_CUBE_WIDTH; // 80
            var t = this.CORNER_WIDTH; // 10

            // Top edges (Z = +45)
            object.add(this.createEdgeBox(ViewCubeElement.TopBackEdge, new THREE.Vector3(0, h, h), [w, t, t]));
            object.add(this.createEdgeBox(ViewCubeElement.TopFrontEdge, new THREE.Vector3(0, -h, h), [w, t, t]));
            object.add(this.createEdgeBox(ViewCubeElement.TopRightEdge, new THREE.Vector3(h, 0, h), [t, w, t]));
            object.add(this.createEdgeBox(ViewCubeElement.TopLeftEdge, new THREE.Vector3(-h, 0, h), [t, w, t]));

            // Bottom edges (Z = -45)
            object.add(this.createEdgeBox(ViewCubeElement.BottomBackEdge, new THREE.Vector3(0, h, -h), [w, t, t]));
            object.add(this.createEdgeBox(ViewCubeElement.BottomFrontEdge, new THREE.Vector3(0, -h, -h), [w, t, t]));
            object.add(this.createEdgeBox(ViewCubeElement.BottomRightEdge, new THREE.Vector3(h, 0, -h), [t, w, t]));
            object.add(this.createEdgeBox(ViewCubeElement.BottomLeftEdge, new THREE.Vector3(-h, 0, -h), [t, w, t]));

            // Side edges (Z = 0)
            object.add(this.createEdgeBox(ViewCubeElement.FrontRightEdge, new THREE.Vector3(h, -h, 0), [t, t, w]));
            object.add(this.createEdgeBox(ViewCubeElement.FrontLeftEdge, new THREE.Vector3(-h, -h, 0), [t, t, w]));
            object.add(this.createEdgeBox(ViewCubeElement.BackRightEdge, new THREE.Vector3(h, h, 0), [t, t, w]));
            object.add(this.createEdgeBox(ViewCubeElement.BackLeftEdge, new THREE.Vector3(-h, h, 0), [t, t, w]));

            return object;
        }

        createEdgeBox(name, position, size) {
            var geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
            var material = new THREE.MeshBasicMaterial({
                color: this.EDGE_COLOUR,
                opacity: this.EDGE_OPACITY,
                transparent: true,
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            mesh.position.copy(position);
            mesh.userData = { tick: 0 };
            return mesh;
        }

        createViewCubeCorners() {
            var object = new THREE.Object3D();
            var h = (this.INNER_CUBE_WIDTH + this.OUTER_CUBE_WIDTH) / 4; // 45
            var t = this.CORNER_WIDTH; // 10

            // 8 corners
            var positions = [
                [h, h, h, ViewCubeElement.TopBackRightCorner],
                [h, -h, h, ViewCubeElement.TopFrontRightCorner],
                [-h, -h, h, ViewCubeElement.TopFrontLeftCorner],
                [-h, h, h, ViewCubeElement.TopBackLeftCorner],
                [h, h, -h, ViewCubeElement.BottomBackRightCorner],
                [h, -h, -h, ViewCubeElement.BottomFrontRightCorner],
                [-h, -h, -h, ViewCubeElement.BottomFrontLeftCorner],
                [-h, h, -h, ViewCubeElement.BottomBackLeftCorner],
            ];

            for (var i = 0; i < positions.length; i++) {
                var p = positions[i];
                var geometry = new THREE.BoxGeometry(t, t, t);
                var material = new THREE.MeshBasicMaterial({
                    color: this.CORNER_COLOR,
                    opacity: this.CORNER_OPACITY,
                    transparent: true,
                });
                var mesh = new THREE.Mesh(geometry, material);
                mesh.name = p[3];
                mesh.position.set(p[0], p[1], p[2]);
                mesh.userData = { tick: 0 };
                object.add(mesh);
            }

            return object;
        }

        createCorner(name, position, rotations) {
            var object = new THREE.Object3D();
            var geometry = new THREE.PlaneGeometry(this.CORNER_WIDTH, this.CORNER_WIDTH);
            var material = new THREE.MeshBasicMaterial({
                color: this.CORNER_COLOR,
                opacity: this.CORNER_OPACITY,
                transparent: true,
            });
            var userData = { tick: 0 };
            var cornerFrontFace = new THREE.Mesh(geometry, material);
            cornerFrontFace.name = name;
            cornerFrontFace.userData = userData;
            cornerFrontFace.position.set(this.CORNER_WIDTH / 2, this.CORNER_WIDTH / 2, 0);

            var cornerBottomFace = new THREE.Mesh(geometry, material);
            cornerBottomFace.name = name;
            cornerBottomFace.userData = userData;
            cornerBottomFace.position.set(this.CORNER_WIDTH / 2, 0, -this.CORNER_WIDTH / 2);
            cornerBottomFace.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

            var cornerLeftFace = new THREE.Mesh(geometry, material);
            cornerLeftFace.name = name;
            cornerLeftFace.userData = userData;
            cornerLeftFace.position.set(0, this.CORNER_WIDTH / 2, -this.CORNER_WIDTH / 2);
            cornerLeftFace.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

            object.add(cornerFrontFace);
            object.add(cornerBottomFace);
            object.add(cornerLeftFace);
            object.position.copy(position);
            rotations.forEach(function(rotation) {
                object.rotateOnAxis(rotation.axis, rotation.rad);
            });
            return object;
        }

        getBBox() {
            var bbox = new THREE.Box3();
            bbox.setFromObject(this);
            return bbox;
        }

        getDirectionByElement(viewCubeName) {
            switch (viewCubeName) {
                case ViewCubeElement.TopFace: return new THREE.Vector3(0, 0, 1);
                case ViewCubeElement.BottomFace: return new THREE.Vector3(0, 0, -1);
                case ViewCubeElement.FrontFace: return new THREE.Vector3(0, -1, 0);
                case ViewCubeElement.BackFace: return new THREE.Vector3(0, 1, 0);
                case ViewCubeElement.LeftFace: return new THREE.Vector3(-1, 0, 0);
                case ViewCubeElement.RightFace: return new THREE.Vector3(1, 0, 0);
                case ViewCubeElement.TopFrontEdge: return new THREE.Vector3(0, -1, 1);
                case ViewCubeElement.TopRightEdge: return new THREE.Vector3(1, 0, 1);
                case ViewCubeElement.TopBackEdge: return new THREE.Vector3(0, 1, 1);
                case ViewCubeElement.TopLeftEdge: return new THREE.Vector3(-1, 0, 1);
                case ViewCubeElement.BottomFrontEdge: return new THREE.Vector3(0, -1, -1);
                case ViewCubeElement.BottomRightEdge: return new THREE.Vector3(1, 0, -1);
                case ViewCubeElement.BottomBackEdge: return new THREE.Vector3(0, 1, -1);
                case ViewCubeElement.BottomLeftEdge: return new THREE.Vector3(-1, 0, -1);
                case ViewCubeElement.FrontLeftEdge: return new THREE.Vector3(-1, -1, 0);
                case ViewCubeElement.FrontRightEdge: return new THREE.Vector3(1, -1, 0);
                case ViewCubeElement.BackRightEdge: return new THREE.Vector3(1, 1, 0);
                case ViewCubeElement.BackLeftEdge: return new THREE.Vector3(-1, 1, 0);
                case ViewCubeElement.TopFrontLeftCorner: return new THREE.Vector3(-1, -1, 1);
                case ViewCubeElement.TopFrontRightCorner: return new THREE.Vector3(1, -1, 1);
                case ViewCubeElement.TopBackRightCorner: return new THREE.Vector3(1, 1, 1);
                case ViewCubeElement.TopBackLeftCorner: return new THREE.Vector3(-1, 1, 1);
                case ViewCubeElement.BottomFrontLeftCorner: return new THREE.Vector3(-1, -1, -1);
                case ViewCubeElement.BottomFrontRightCorner: return new THREE.Vector3(1, -1, -1);
                case ViewCubeElement.BottomBackRightCorner: return new THREE.Vector3(1, 1, -1);
                case ViewCubeElement.BottomBackLeftCorner: return new THREE.Vector3(-1, 1, -1);
                default: break;
            }
            return undefined;
        }

        update() {
            var scope = this;
            this.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    scope.updateViewCube(child);
                }
            });
        }

        updateViewCube(mesh) {
            this.updateMeshTick(mesh);
            var tick = mesh.userData.tick;
            if (mesh.name.indexOf("Face") > -1) {
                var material = mesh.userData.material;
                if (material) {
                    var color = gradient(this.FACE_BACKGROUND_COLOR, this.FACE_HOVER_BACKGROUND_COLOR, tick);
                    if (tick > 0) material.color.set(color);
                }
                if (this.innerViewCubeMesh) {
                    this.updateMeshTick(mesh, "translateTick", 2);
                    var normal = mesh.position.clone().normalize();
                    var transTick = Math.max(mesh.userData.translateTick * 2 - 2, 0);
                    normal.multiplyScalar((transTick * this.CORNER_WIDTH) / 2);
                    if (transTick > 0) {
                        this.innerViewCubeMesh.position.copy(normal);
                    }
                }
            } else if (mesh.name.indexOf("Edge") > -1) {
                var material = mesh.material;
                var color = gradient(this.EDGE_COLOUR, this.FACE_HOVER_BACKGROUND_COLOR, tick);
                material.color.set(color);
                material.opacity = Math.max(tick, 0.1);
            } else if (mesh.name.indexOf("Corner") > -1) {
                var material = mesh.material;
                var color = gradient(this.CORNER_COLOR, this.FACE_HOVER_BACKGROUND_COLOR, tick);
                material.color.set(color);
                var scale = 1 + tick * 0.3;
                mesh.scale.set(scale, scale, scale);
            }
        }

        updateMeshTick(mesh, propName, maxTick) {
            propName = propName || "tick";
            maxTick = maxTick || 1;
            var userData = mesh.userData;
            var propVal = userData[propName];
            if (propVal === undefined) return;
            if (mesh.name === this.activateMeshName && propVal < maxTick) {
                userData[propName] += 0.05;
            } else if (mesh.name !== this.activateMeshName && propVal > 0) {
                userData[propName] -= 0.05;
            }
            if (userData[propName] > 0 && userData[propName] < maxTick) {
                this.dirty = true;
            }
            userData[propName] = Math.min(Math.max(userData[propName], 0), maxTick);
        }
    }

    class Controller {
        constructor(rxCore) {
            this.rxCore = rxCore;
            this.container = undefined;
            this.scene = undefined;
            this.camera = undefined;
            this.renderer = undefined;
            this.viewCube = undefined;
            this.width = 160;
            this.height = 160;
            this.lastCoords = undefined;
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            this.requestAnimationFrameHandle = undefined;

            this.init();
        }

        init() {
            this.createContainer();
            this.initScene();
            this.initRenderer();
            this.initCamera();
            this.initLights();
            this.initViewCube();
            this.initEvents();
            this.animate();
        }

        createContainer() {
            var container = document.getElementById("rx-view-cube-container");
            if (!container) {
                container = document.createElement("div");
                container.id = "rx-view-cube-container";
                container.style.width = this.width + "px";
                container.style.height = this.height + "px";
                container.style.position = "absolute";
                container.style.top = "15px";
                container.style.right = "15px";
                container.style.zIndex = "1000";
                container.style.pointerEvents = "auto";
                container.style.display = "none";
                document.body.appendChild(container);
            }
            this.container = container;
        }

        initScene() {
            this.scene = new THREE.Scene();
        }

        initRenderer() {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.width, this.height);
            this.renderer.setClearColor(0x000000, 0);
            this.container.appendChild(this.renderer.domElement);
        }

        initCamera() {
            this.camera = new THREE.OrthographicCamera(
                -this.width / 2, this.width / 2,
                this.height / 2, -this.height / 2,
                0.1, 10000
            );
            this.camera.position.set(300, 300, 300);
            this.camera.lookAt(0, 0, 0);
            this.camera.zoom = 1;
            this.camera.updateProjectionMatrix();
            this.scene.add(this.camera);
        }

        initLights() {
            var ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            this.scene.add(ambientLight);
            var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(-100, 200, 100);
            this.scene.add(directionalLight);
        }

        initViewCube() {
            this.viewCube = new Cube();
            this.scene.add(this.viewCube);
            this.zoomToBBox(this.viewCube.getBBox());
        }

        initEvents() {
            var scope = this;
            this.container.addEventListener('pointerdown', function(e) { scope.onPointerDown(e); });
            this.container.addEventListener('pointermove', function(e) { scope.onPointerMove(e); });
            this.container.addEventListener('pointerleave', function(e) { scope.onPointerLeave(e); });
            
            // Sync with RxCore camera
            // Note: We need a way to be notified when RxCore camera changes.
            // In rxcorefunctions.js, we can call manager.updateFromCamera() in the animate loop.
        }

        onPointerDown(e) {
            e.stopPropagation();
            var rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            var intersects = this.raycaster.intersectObjects(this.viewCube.children, true);
            
            if (intersects.length > 0) {
                var object = intersects[0].object;
                var name = object.name;
                var direction = this.viewCube.getDirectionByElement(name);
                if (direction) {
                    this.updateViewerCamera(direction);
                }
            }
        }

        onPointerMove(e) {
            var rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            var intersects = this.raycaster.intersectObjects(this.viewCube.children, true);
            
            if (intersects.length > 0) {
                this.viewCube.activateMeshName = intersects[0].object.name;
            } else {
                this.viewCube.activateMeshName = undefined;
            }
        }

        onPointerLeave(e) {
            this.viewCube.activateMeshName = undefined;
        }

        updateViewerCamera(direction) {
            // direction is the new target direction for the camera to look at
            // RxCore should have a flyTo or similar method.
            if (typeof this.rxCore.flyToDirection === 'function') {
                this.rxCore.flyToDirection(direction);
            } else {
                // Fallback implementation if flyToDirection doesn't exist
                console.warn("RxCore.flyToDirection is not defined");
            }
        }

        updateFromCamera(mainCamera) {
            if (!this.camera || !mainCamera) return;
            
            var direction = new THREE.Vector3();
            mainCamera.getWorldDirection(direction);
            direction.normalize();

            var up = mainCamera.up.clone();
            
            var distanceFactor = 200;
            this.camera.position.set(
                -direction.x * distanceFactor,
                -direction.y * distanceFactor,
                -direction.z * distanceFactor
            );
            this.camera.lookAt(0, 0, 0);
            this.camera.up.copy(up);
            this.camera.updateMatrixWorld();
        }

        animate() {
            var scope = this;
            this.requestAnimationFrameHandle = requestAnimationFrame(function() { scope.animate(); });
            
            if (this.viewCube) {
                this.viewCube.update();
                this.renderer.render(this.scene, this.camera);
            }
        }

        setVisible(visible) {
            if (this.container) {
                this.container.style.display = visible ? "block" : "none";
            }
        }

        zoomToBBox(bbox) {
            var width = this.camera.right - this.camera.left;
            var height = this.camera.top - this.camera.bottom;
            var bbSize = new THREE.Vector3();
            bbox.getSize(bbSize);
            var distance = Math.sqrt(Math.pow(bbSize.x, 2) + Math.pow(bbSize.y, 2) + Math.pow(bbSize.z, 2));
            var zoom = Math.min(width / distance, height / distance) * 0.8;
            this.camera.zoom = zoom;
            this.camera.updateProjectionMatrix();
        }
    }

export const ViewCube = {
        Controller,
        ViewCubeElement
    };


