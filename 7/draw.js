
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

    x = (800 / 2) + x * (800 / 2);
    y = (600 / 2) - y * (800 / 2);

    var coord = new Vector3(x, y, 0);
    return coord;
};

var modelCoord = function(_x, _y){
    var x = _x;
    var y = _y;

    x = x * 1/(800 / 2) - 1;
    y = 1 - y * 1/(600 / 2);

    var coord = new Vector3(x, y, 0);
    return coord;
};

// Pascal's triangle object
var pascalTriangle = function(rows){
    // Number of rows the triangle contains
    this.rows = rows;

    // The 2D array holding the rows of the triangle
    this.triangle = new Array();
    for (var r = 0; r < rows; r++) {
        this.triangle[r] = new Array();
        for (var i = 0; i <= r; i++) {
            if (i == 0 || i == r)
                this.triangle[r][i] = 1;
            else
                this.triangle[r][i] = this.triangle[r-1][i-1]+this.triangle[r-1][i];
        }
    } 

    return this.triangle[rows-1];
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



//*************************//
// Shapes Vertices & Edges
//*************************//
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
   g.beginPath();
   for(var e = 0; e < numEdge; e++){

      pointA[0] = (width  / 2) + verts[edges[e][0]][0] * (width / 2);
      pointA[1] = (height / 2) - verts[edges[e][0]][1] * (width / 2);
      pointB[0] = (width  / 2) + verts[edges[e][1]][0] * (width / 2);
      pointB[1] = (height / 2) - verts[edges[e][1]][1] * (width / 2);

      g.moveTo(pointA[0], pointA[1]);
      g.lineTo(pointB[0], pointB[1]);
   }
   g.stroke();
   g.closePath();
}



//**********************//
// Spline Object
//**********************//

var Spline = function() {
    this.positions = [];
}

Spline.prototype.addPoint = function(_x, _y){
    var pos = new Vector3(0, 0, 0);
    pos = modelCoord(_x, _y);
    this.positions.push(pos); 
};

Spline.prototype.resetPoints = function(){
    this.positions = [];
};

Spline.prototype.detectPoints = function(_mousePos){
    var size = this.positions.length;
    var offset = 30;
  
    for(var i = 0; i < size; i++){
        var index = i;
        var coord = pixelCoord(this.positions[i].x, this.positions[i].y);
        var distX = Math.abs(coord.x - _mousePos.x);
        var distY = Math.abs(coord.y - _mousePos.y);
        
        if(distX < offset && distY < offset){
            return index;
        }
    }
};

Spline.prototype.deletePoints = function(_index){
    var i = _index;
    this.positions.splice(i, 1);
};

//**********************//
// Hermite Spline Object
//**********************//

var HSpline = function(start, end){
    Spline.call(this);

    var p0 = new Vector3(start[0], start[1], 0);
    var p1 = new Vector3(end[0], end[1], 0);
    this.t0 = new Vector3(0, 2, 0);
    this.t1 = new Vector3(0, 2, 0);
    this.positions = [p0, p1];
}

HSpline.prototype = Object.create(Spline.prototype);

HSpline.prototype.transform = function(_g, _m){
    var context = _g;
    var matrix  = _m.matrix;
    var size = this.positions.length;

    context.strokeStyle = 'black';
    context.fillStyle = 'black';

    ////draw ellipse//--->
    for(var i = 0; i < size; i ++){
        context.beginPath();
        var pos = pixelCoord( this.positions[i].x, this.positions[i].y );
        context.arc(pos.x, pos.y, 3, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }

    ////draw curve//--->
    var tRatio = 30; //<-smoothness of curve
    var dst = new Vector3(0, 0, 0);
    //set variable for convenient
    var p0, p1, t0, t1;
    t0 = this.t0;
    t1 = this.t1;
    
    //init curve
    context.beginPath();
    //move to initial point
    if(size > 0){
        var root = pixelCoord(this.positions[0].x, this.positions[0].y);
        context.moveTo(root.x, root.y);

       for(var i = 1; i < size; i++){
         // p0 = this.positions[i-1];
         // p1 = this.positions[i];
         p0 = this.positions[i-1];
         p1 = this.positions[i];
         

         if(i > 1){
             // t0 = p1.sub(this.positions[i-2]);
             t0 = p0;
             //t0 = t0.multScalar(2);
         } else {
            t0 = new Vector3(0,2,0);
         }

         if(i < size - 1){
             // t1 = this.positions[i+1].sub(p0);
             t1 = p1;
             //t1 = t1.multScalar(2);
         } else {
            t1 = new Vector3(0,2,0);
         }

         //console.log(t0);

         //cal curve
         for(var j = 0; j < tRatio; j++){
             var t = j / (tRatio-1);

             var A = 2.0 * Math.pow(t, 3) - 3.0 * Math.pow(t, 2) + 1.0;
             var B = Math.pow(t, 3) - 2.0 * Math.pow(t, 2) + t;
             var C = -2.0 * Math.pow(t, 3) + 3.0 * Math.pow(t, 2);
             var D = Math.pow(t, 3) - Math.pow(t, 2);

             dst.x = A * p0.x + B * t0.x + C * p1.x + D * t1.x;
             dst.y = A * p0.y + B * t0.y + C * p1.y + D * t1.y;
             dst.z = A * p0.z + B * t0.z + C * p1.z + D * t1.z;

             curve = pixelCoord(dst.x, dst.y);
             context.lineTo(curve.x, curve.y);

         }
        } 
    
    }
    context.stroke();
};


//**********************//
// Bezier Spline Object
//**********************//

var BSpline = function(start, end){
    Spline.call(this);

    var p0 = new Vector3(start[0], start[1], 0);
    var p1 = new Vector3(end[0], end[1], 0);
    // this.t0 = new Vector3(0, 2, 0);
    // this.t1 = new Vector3(0, 2, 0);
    this.positions = [p0, p1];
}

BSpline.prototype = Object.create(Spline.prototype);

BSpline.prototype.transform = function(_g, _m){
    var context = _g;
    var matrix  = _m.matrix;
    var size = this.positions.length;

    context.strokeStyle = 'black';
    context.fillStyle = 'black';

    ////draw ellipse//--->
    for(var i = 0; i < size; i ++){
        context.beginPath();
        var pos = pixelCoord( this.positions[i].x, this.positions[i].y );
        context.arc(pos.x, pos.y, 3, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }

    ////draw curve//--->
    var tRatio = 30; //<-smoothness of curve
    // var dst = new Vector3(0, 0, 0);
    //set variable for convenient
    // var p0, p1, t0, t1;
    // t0 = this.t0;
    // t1 = this.t1;
    
    //init curve
    context.beginPath();
    //move to initial point
    if(size > 0){
        var root = pixelCoord(this.positions[0].x, this.positions[0].y);
        context.moveTo(root.x, root.y);
        //get pascal triangle row values
        var pTri = pascalTriangle(size);
        //cal curve
        for(var j = 0; j < tRatio; j++){
            var t = j / (tRatio - 1.0);

            //complete equation with pascals triangle
            var sum = new Vector3(0, 0, 0);
            for(var p = 0; p < size; p++){
                sum.x += pTri[p] * Math.pow((1-t), (size-1-p)) * Math.pow(t, p) * this.positions[p].x;
                sum.y += pTri[p] * Math.pow((1-t), (size-1-p)) * Math.pow(t, p) * this.positions[p].y;
                sum.z += pTri[p] * Math.pow((1-t), (size-1-p)) * Math.pow(t, p) * this.positions[p].z;
            }

            var curve = pixelCoord(sum.x, sum.y);
            context.lineTo(curve.x, curve.y);
        }
    }
    context.stroke();
};




