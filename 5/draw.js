
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
Cube
- vertices
- edges
*/
// var Cube = function(_x, _y, _z, _r){
//    this.x = _x/300 - 1;
//    this.y = 1 - _y/300;
//    this.z = _z;
//    this.r = _r/300 - 1;

//    this.cubeVertices = [];
//    this.cubeVertices.push( new Vector3(this.x - this.r/2.0, this.y - this.r/2.0, this.z - this.r/2.0) ); //0
//    this.cubeVertices.push( new Vector3(this.x + this.r/2.0, this.y - this.r/2.0, this.z - this.r/2.0) ); //1
//    this.cubeVertices.push( new Vector3(this.x + this.r/2.0, this.y + this.r/2.0, this.z - this.r/2.0) ); //2
//    this.cubeVertices.push( new Vector3(this.x - this.r/2.0, this.y + this.r/2.0, this.z - this.r/2.0) ); //3
//    this.cubeVertices.push( new Vector3(this.x - this.r/2.0, this.y - this.r/2.0, this.z + this.r/2.0) ); //4
//    this.cubeVertices.push( new Vector3(this.x + this.r/2.0, this.y - this.r/2.0, this.z + this.r/2.0) ); //5
//    this.cubeVertices.push( new Vector3(this.x + this.r/2.0, this.y + this.r/2.0, this.z + this.r/2.0) ); //6
//    this.cubeVertices.push( new Vector3(this.x - this.r/2.0, this.y + this.r/2.0, this.z + this.r/2.0) ); //7
// }

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

Matrix.prototype.transform = function(src, dst){
   for(var i = 0; i < src.length; i++){
      for(var j = 0; j < this.matrix.length; j ++) {
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

function drawShape(g, verts, edges, width, height) {
   var numVert = verts.length,
      numEdge = edges.length,
      pointA = [],
      pointB = [];

   // console.log("verts, ", verts);

   g.beginPath();
   for(var e = 0; e < numEdge; e++){
      //pointA = verts[edges[e][0]].slice(0); // clone the array to prevent manipulation
      //pointB = verts[edges[e][1]].slice(0); // clone the array to prevent manipulation

      pointA[0] = (width  / 2) + verts[edges[e][0]][0] * (width / 2);
      pointA[1] = (height / 2) - verts[edges[e][0]][1] * (width / 2);
      pointB[0] = (width  / 2) + verts[edges[e][1]][0] * (width / 2);
      pointB[1] = (height / 2) - verts[edges[e][1]][1] * (width / 2);
      
      g.moveTo(pointA[0], pointA[1]);
      // console.log("pointA[0] ", pointA[0]);
      // console.log("pointA[1] ", pointA[1]);
      g.lineTo(pointB[0], pointB[1]);
   }
   g.stroke();
   g.closePath();
}




