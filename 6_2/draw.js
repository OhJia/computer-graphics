
function Vector3(x, y, z) {
   this.x = 0;
   this.y = 0;
   this.z = 0;
   this.set(x, y, z);
}
Vector3.prototype = {
   set : function(x, y, z) {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      if (z !== undefined) this.z = z;
   },
}

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id) {
   var canvas = document.getElementById(id);
   canvas.setCursor = function(x, y, z) {
      var r = this.getBoundingClientRect();
 this.cursor.set(x - r.left, y - r.top, z);
   }
   canvas.cursor = new Vector3(0, 0, 0);
   canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
   canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
   canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
   canvases.push(canvas);
   return canvas;
}

function tick() {
   time = (new Date()).getTime() / 1000 - startTime;
   for (var i = 0 ; i < canvases.length ; i++)
      if (canvases[i].update !== undefined) {
    var canvas = canvases[i];
         var g = canvas.getContext('2d');
         g.clearRect(0, 0, canvas.width, canvas.height);
         canvas.update(g);
      }
   setTimeout(tick, 1000 / 60);
}
tick();


/*
matrix
x identity
x scale
x rotation x, y, z
x translate
*/
var Matrix = function(){
   this.matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
   return this;
}

Matrix.prototype.scale = function(x, y, z){
   this._scaleMatrix = [[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]];
   this.matrix = multiplyMatrix(this.matrix, this._scaleMatrix);
   return this;
}

Matrix.prototype.rotateX = function(theta){
   var cos = Math.cos(theta);
   var sin = Math.sin(theta);
   this._rotateMatrixX = [[1, 0, 0, 0], [0, cos, -sin, 0], [0, sin, cos, 0], [0, 0, 0, 1]];
   this.matrix = multiplyMatrix(this.matrix, this._rotateMatrixX);
   return this;
}

Matrix.prototype.rotateY = function(theta){
   var cos = Math.cos(theta);
   var sin = Math.sin(theta);
   this._rotateMatrixY = [[cos, 0, sin, 0], [0, 1, 0, 0], [-sin, 0, cos, 0], [0, 0, 0, 1]];
   this.matrix = multiplyMatrix(this.matrix, this._rotateMatrixY);
   return this;
}

Matrix.prototype.rotateZ = function(theta){
   var cos = Math.cos(theta);
   var sin = Math.sin(theta);
   this._rotateMatrixZ = [[cos, -sin, 0, 0], [sin, cos, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
   this.matrix = multiplyMatrix(this.matrix, this._rotateMatrixZ);
   return this;
}

Matrix.prototype.translate = function(x, y, z){
   this._translateMatrix = [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]];
   this.matrix = multiplyMatrix(this.matrix, this._translateMatrix);
   return this;
}

var noise = new Noise();
Matrix.prototype.transform = function(src, dst){
   for(var i = 0; i < src.length; i++){
      for(var j = 0; j < this.matrix.length; j ++) {
         //this.matrix[1][1] *= j;
         dst[i][j] = dot(src[i],this.matrix[j]);
      }
   }

   //console.log(dst);
   return dst;
}

function multiplyMatrix(a, b){
   var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);
      // console.log(b[0]);

   if(aNumCols != aNumRows) {
      throw new Error("cannot multiply matrices of unequal width a and height b");
   }

   for (var r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols);
      for (var c = 0; c < bNumCols; ++c) {
         m[r][c] = 0;
         for (var i = 0; i < aNumCols; ++i) {
            m[r][c] += a[r][i] * b[i][c];
         }
      }
      }
   return m;
}

function dot(a, b){
   var aLen = a.length,
   bLen = b.length,
   d = 0;

   if(aLen != bLen){
      throw new Error("cannot take dot product of vectors with unequal length");
   }

   for(var i = 0; i < aLen; i++) {
      d += a[i] * b[i];
   }
   return d;
}

// CYLINDER VERTICES & EDGES
var Cylinder = function(u, v) {
   this.edges = [];  
   this.numU = u;
   this.numV = v;
   this.u;
   this.v;
   this.theta;
   this.cos, this.sin; 
   this.index;
   this.numVertices = this.numU * this.numV + 1;

   this.vertices = []; 
   this.nVertices = [];

   return this;

}
Cylinder.prototype.makeVerticesEdges = function() {

   for (var i = 0; i < this.numV; i++){
      this.v = i/this.numV;
      for (var j = 0; j < this.numU; j++){
         this.index = (i * this.numV) + j;
         this.u = j/this.numU;
         this.theta = 2 * Math.PI * this.u;
         this.cos = Math.cos(this.theta);
         this.sin = Math.sin(this.theta);
         this.vertices.push([this.sin, this.cos, 2*this.v-1, 1]);
         if (j > 0){
            this.edges.push([this.index - 1, this.index]);
         } else {
            this.edges.push([this.numU + this.index - 1, this.index]);
         }
         if (i > 0){
            this.edges.push([this.index - this.numV, this.index]);
         }
      }
   }

   for (var i = 0; i < this.vertices.length; i++){
      this.nVertices[i] = new Array(4);
   }

   return this;

}

// SPHERE VERTICES & EDGES
var Sphere = function(u, v){
   this.edges = [];  
   this.numU = u, this.numV = v;
   this.index;
   this.vertices = []; 
   this.nVertices = [];

   return this;
}

Sphere.prototype.makeVerticesEdges = function(){
   for (var i = 0; i < this.numV; i++){
      this.v = i/(this.numV-1);
      this.phi = Math.PI * this.v - Math.PI/2;
      for (var j = 0; j < this.numU; j++){
         this.index = (i * this.numV) + j;
         this.u = j/(this.numU-1);
         this.theta = 2 * Math.PI * this.u;
         this.x = Math.cos(this.phi) * Math.cos(this.theta);
         this.y = Math.cos(this.phi) * Math.sin(this.theta);
         this.z = Math.sin(this.phi);
         this.vertices.push([this.x, this.y, this.z, 1]);
         if (j > 0){
            this.edges.push([this.index - 1, this.index]);
         } else {
            this.edges.push([this.numU + this.index - 1, this.index]);
         }
         if (i > 0){
            this.edges.push([this.index - this.numV, this.index]);
         } 
      }
   }

   for (var i = 0; i < this.vertices.length; i++){
      this.nVertices[i] = new Array(4);
   }

   return this;
}

// TORUS VERTICES & EDGES
var Torus = function(u, v) {
   this.edges = [];  
   this.numU = u, this.numV = v;
   this.index;
   this.vertices = []; 
   this.nVertices = [];
   this.r = 0.4;

   return this;
}

Torus.prototype.makeVerticesEdges = function() {
   for (var i = 0; i < this.numV; i++){
      this.v = i/(this.numV -1);
      this.phi = Math.PI * 2 * this.v;
      for (var j = 0; j < this.numU; j++){
         this.index = (i * this.numV) + j;
         this.u = j/(this.numU -1);
         this.theta = 2 * Math.PI * this.u;
         this.x = (0.6 + this.r * Math.cos(this.phi)) * Math.cos(this.theta);
         this.y = (0.6 + this.r * Math.cos(this.phi)) * Math.sin(this.theta);
         this.z = this.r * Math.sin(this.phi);
         this.vertices.push([this.x, this.y, this.z, 1]);
         if (j > 0){
            this.edges.push([this.index - 1, this.index]);
         } else {
            this.edges.push([this.numU + this.index - 1, this.index]);
         }
         if (i > 0){
            this.edges.push([this.index - this.numV, this.index]);
         }
      }
   }

   for (var i = 0; i < this.vertices.length; i++){
      this.nVertices[i] = new Array(4);
   }

   return this;
}

// BONUS VERTICES & EDGES
var Bonus1 = function(u, v) {
   this.edges = [];  
   this.numU = u, this.numV = v;
   this.uMax = 2 * Math.PI, this.uMin = 0;
   this.delu = (this.uMax - this.uMin)/(this.numU-1);
   this.vMax = 0.4, this.vMin = -0.4;
   this.delv = (this.vMax - this.vMin)/(this.numV-1);
   this.index;
   this.vertices = []; 
   this.nVertices = [];
   this.r = 0.4;
   return this;
}

Bonus1.prototype.makeVerticesEdges = function() {
   var u, v;
   for (var i = 0, u = this.uMin; i < this.numV; i++, u+=this.delu){
      //var v = i/bonusNumV;
      for (var j = 0, v = this.vMin; j < this.numU; j++, v+=this.delv){
         this.phi = Math.PI * 2 * v;
         this.index = (i * this.numV) + j;
         //var u = j/bonusNumU;
         this.theta = 2 * Math.PI * this.u;
         this.x = Math.cos(u) + v*Math.cos(u/2) * Math.cos(u);
         this.y = Math.sin(u) + v*Math.cos(u/2) * Math.sin(u);
         this.z = v * Math.sin(u/2);
         this.vertices.push([this.x, this.y, this.z, 1]);
         if (j > 0){
            this.edges.push([this.index - 1, this.index]);
         } else {
            this.edges.push([this.numU + this.index - 1, this.index]);
         }
         if (i > 0){
            this.edges.push([this.index - this.numV, this.index]);
         }
      }
   }

   for (var i = 0; i < this.vertices.length; i++){
      this.nVertices[i] = new Array(4);
   }

   return this;

}

function drawShape(g, verts, edges, width, height) {
   var numVert = verts.length,
      numEdge = edges.length,
      pointA = [],
      pointB = [];

   var c = ["0", "E", "F", "F"];
   var x = 8;
   // console.log("verts, ", verts);
   // console.log("edges, ", edges);
   //console.log("edges, ", edges[0]);

   g.beginPath();
   for(var e = 0; e < numEdge; e++){
      //pointA = verts[edges[e][0]].slice(0); // clone the array to prevent manipulation
      //pointB = verts[edges[e][1]].slice(0); // clone the array to prevent manipulation
      //console.log(e, edges[e]);
      pointA[0] = (width  / 2) + verts[edges[e][0]][0] * (width / 2);
      pointA[1] = (height / 2) - verts[edges[e][0]][1] * (width / 2);
      pointB[0] = (width  / 2) + verts[edges[e][1]][0] * (width / 2);
      pointB[1] = (height / 2) - verts[edges[e][1]][1] * (width / 2);
      if (x == 0) {
         x = 8;
      } else {
         x = 0;
      }
      // g.strokeStyle="#" + c[e%3] + x + "0000";

      //console.log(e,e%5,"#" + c[e%5] + c[Math.min(e%5+1, 5)] + c[Math.min(e%5+2, 5)])
      g.moveTo(pointA[0], pointA[1]);
      // console.log("pointA[0] ", pointA[0]);
      // console.log("pointA[1] ", pointA[1]);
      g.lineTo(pointB[0], pointB[1]);
   }
   g.stroke();
   g.closePath();
}




