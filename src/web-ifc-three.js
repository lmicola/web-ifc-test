/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
 
 import * as THREE from "three";
 import {  ms} from 'web-ifc';
 import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
   
 export class IfcThree
 {
    ifcAPI;
 
     /**
         Creates an instance of IfcThree, requires a valid instance of IfcAPI
     */
     constructor(ifcAPI)
     {
         this.ifcAPI = ifcAPI;
     }
 
     /**
      * Loads all geometry for the model with id "modelID" into the supplied scene
      * @scene Threejs Scene object
      * @modelID Model handle retrieved by OpenModel, model must not be closed
     */
      LoadAllGeometry(scene, modelID) {
 
         const startUploadingTime = ms();
 

         let geometries = [];
         let transparentGeometries = [];
         let count = 0;
         this.ifcAPI.StreamAllMeshes(modelID, async(mesh) => {
             // only during the lifetime of this function call, the geometry is available in memory
             const placedGeometries = mesh.geometries;
             for (let i = 0; i < placedGeometries.size(); i++)
             {
                 const placedGeometry = placedGeometries.get(i);
                 let mesh = this.getPlacedGeometry(modelID, placedGeometry);
                 let geom = mesh.geometry.applyMatrix4(mesh.matrix);
                 let mesh2 =new THREE.Mesh(geom, mesh.material.clone());

                 if (placedGeometry.color.w !== 1)
                 {
                     transparentGeometries.push(geom);
                 }
                 else
                 {
                     geometries.push(geom);
                 }
                 scene.add(mesh2);
                 count++;


             }

         });

     }
     
      getFlatMeshes(modelID) {
         const startGeomTime = ms();
         const flatMeshes = this.ifcAPI.LoadAllGeometry(modelID);
         const endGeomTime = ms();
         //console.log(`Loaded ${flatMeshes.size()} flatMeshes`);
         //console.log(`Loading geometry took ${endGeomTime - startGeomTime} ms`);
         return flatMeshes;
     }
     
      getPlacedGeometry(modelID, placedGeometry) {
         const geometry = this.getBufferGeometry(modelID, placedGeometry);
         const material = this.getMeshMaterial(placedGeometry.color);
         //console.log(placedGeometry.color);
         const mesh = new THREE.Mesh(geometry, material);
         mesh.matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
         mesh.matrixAutoUpdate = false;
         return mesh;
     }
     
      getBufferGeometry(modelID, placedGeometry) {
         // WARNING: geometry must be deleted when requested from WASM
         const geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
         const verts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
         const indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
         const bufferGeometry = this.ifcGeometryToBuffer(placedGeometry.color, verts, indices);
 
         //@ts-ignore
         geometry.delete();
         return bufferGeometry;
     }
 
      materials = {};
     
      getMeshMaterial(color) {
         const col = new THREE.Color(color.x, color.y, color.z);
         const material = new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide });
         material.transparent = color.w !== 1;
         //material.depthWrite = false;
         if (material.transparent) {
            material.opacity = color.w;
            //material.FrontSide = THREE.FrontSide;
            material.depthWrite = false;
         } 
         return material;
     }
     
      getMeshMatrix(matrix) {
         const mat = new THREE.Matrix4();
         mat.fromArray(matrix);
         return mat;
     }
     
      ifcGeometryToBuffer(color, vertexData, indexData) {
         const geometry = new THREE.BufferGeometry();
         let posFloats = new Float32Array(vertexData.length / 2);
         let normFloats = new Float32Array(vertexData.length / 2);
         let colorFloats = new Float32Array(vertexData.length / 2);
 
         for (let i = 0; i < vertexData.length; i += 6)
         {
             posFloats[i / 2 + 0] = vertexData[i + 0];
             posFloats[i / 2 + 1] = vertexData[i + 1];
             posFloats[i / 2 + 2] = vertexData[i + 2];
 
             normFloats[i / 2 + 0] = vertexData[i + 3];
             normFloats[i / 2 + 1] = vertexData[i + 4];
             normFloats[i / 2 + 2] = vertexData[i + 5];
             
             colorFloats[i / 2 + 0] = color.x;
             colorFloats[i / 2 + 1] = color.y;
             colorFloats[i / 2 + 2] = color.z;
         }
        
         geometry.setAttribute(
             'position',
             new THREE.BufferAttribute(posFloats, 3));
         geometry.setAttribute(
             'normal',
             new THREE.BufferAttribute(normFloats, 3));
         geometry.setAttribute(
             'color',
             new THREE.BufferAttribute(colorFloats, 3));
         geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
         return geometry;
     }
 }
