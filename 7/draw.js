
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

Vector3.prototype.sub = function(_target){
    var sum = new Vector3(0, 0, 0);
    sum.x = this.x - _target.x;
    sum.y = this.y - _target.y;
    sum.z = this.z - _target.z;

    return sum;
}
Vector3.prototype.add = function(_target){
    var sum = new Vector3(0, 0, 0);
    sum.x = this.x + _target.x;
    sum.y = this.y + _target.y;
    sum.z = this.z + _target.z;

    return sum;
}

Vector3.prototype.multScalar = function(_s){
    var sum = new Vector3(0, 0, 0);
    sum.x = this.x * _s;
    sum.y = this.y * _s;
    sum.z = this.z * _s;

    return sum;
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


var pixelCoord = function(_x, _y){
    var x = _x;
    var y = _y;

    x = (600  / 2) + x * (600 / 2);
    y = (600 / 2) - y * (600 / 2);

    var coord = new Vector3(x, y, 0);
    return coord;
};


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

// SPLINE

// var HermiteSpline = function(start, end, control1, control2) {
//     this.p1 = start;
//     this.p2 = end;
//     this.c1 = control1;
//     this.c2 = control2;
//     // this.spline = [start, end, control1, control2]
//     return this;
// };

// // This is where the magic happens
// // HermiteSpline.prototype.matrix = function() {
// //    this.matrix = [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]];
// //    return this;
// // }

// HermiteSpline.prototype.interpolate = function(t) {
//     // var t2 = t * t;
//     // var t3 = t * t2;
    
//     // var a = -1 * t3 + 3 * t2 - 3 * t + 1;
//     // var b = t3;
//     // var c =  3 * t3 - 6 * t2 + 3 * t;
//     // var d = -3 * t3 + 3 * t2;
//     var matrix = [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]];
//     var spline = [this.p1, this.p2, this.c1, this.c2];
//     //console.log(spline);
//     var splineABCD = multiplyMatrix(matrix, spline);
//     var a = splineABCD[0];
//     var b = splineABCD[1];
//     var c = splineABCD[2];
//     var d = splineABCD[3];
    
//     return {
//         x: a * t * t * t + b * t * t + c * t + d,
//         y: a * t * t * t + b * t * t + c * t + d
//     }
// };

// HermiteSpline.prototype.transform = function(canvas){
//    var ctx = canvas;
//    ctx.beginPath();
//    var step = 40;
//    ctx.moveTo(this.p1.x, this.p1.y);
//    for (var i = 0; i < step; i++){
//       var t = i / step;
//       var pos = this.interpolate(t);
//       //console.log(pos);
//       ctx.lineTo(pos.x, pos.y);
//    }
//    ctx.stroke();
// }

//**********************//
// Hermite Spline Object
//**********************//
var HSpline = function(start, end, t0, t1){
   var p0 = new Vector3(start[0], start[1], 0);
   var p1 = new Vector3(end[0], end[1], 0);
   var t0 = new Vector3(t0[0], t0[1], 0);
   var t1 = new Vector3(t1[0], t1[1], 0);
   this.positions = [p0, p1, t0, t1];
};
HSpline.prototype.transform = function(_g){
    var context = _g;
    //var matrix  = _m.matrix;
    var size = this.positions.length;

    context.strokeStyle = 'black';

    ////draw ellipse//--->
    // for(var i = 0; i < size; i ++){
    //     context.beginPath();
    //     var pos = pixelCoord( this.positions[i].x, this.positions[i].y );
    //     context.arc(pos.x, pos.y, 3, 0, Math.PI * 2, false);
    //     context.stroke();
    //     context.closePath();
    // }

    ////draw curve//--->
    var tRatio = 50; //<-smoothness of curve
    var dst = new Vector3(0, 0, 0);
    //set variable for convenient
    var p0, p1, t0, t1;
    var curve;
    //init curve
    context.beginPath();
    //move to initial point
    //if(size > 0){
        var root = pixelCoord(this.positions[0].x, this.positions[0].y);
        context.moveTo(root.x, root.y);

        //for(var i = 1; i < size; i++){
            // p0 = this.positions[i-1];
            // p1 = this.positions[i];
            p0 = this.positions[0];
            p1 = this.positions[1];
            t0 = this.positions[2];
            t1 = this.positions[3];

            // if(i > 1){
            //     t0 = p1.sub(this.positions[i-2]);
            //     t0 = t0.multScalar(0.7);
            // } else {
            //     t0 = p0.sub(p0);
            // }

            // if(i < size - 1){
            //     t1 = this.positions[i+1].sub(p0);
            //     t1 = t1.multScalar(0.7);
            // } else {
            //     t1 = p1.sub(p1);
            // }

            //cal curve
            for(var j = 0; j < tRatio; j++){
                var t = j / (tRatio -1);

                var A = 2.0 * Math.pow(t, 3) - 3.0 * Math.pow(t, 2) + 1.0;
                var B = Math.pow(t, 3) - 2.0 * Math.pow(t, 2) + t;
                var C = -2.0 * Math.pow(t, 3) + 3.0 * Math.pow(t, 2);
                var D = Math.pow(t, 3) - Math.pow(t, 2);

                dst.x = A * p0.x + B * t0.x + C * p1.x + D * t1.x;
                dst.y = A * p0.y + B * t0.y + C * p1.y + D * t1.y;
                dst.z = A * p0.z + B * t0.z + C * p1.z + D * t1.z;

                curve = pixelCoord(dst.x, dst.y);
                context.lineTo(curve.x, curve.y);
                console.log(curve.x);
                //return dst;
            }
        //}
    //}
    context.stroke();

};


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




