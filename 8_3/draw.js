var gl, prog;
var pi = Math.PI;

function draw() {
   gl = document.getElementById('canvas1').getContext('experimental-webgl');
   gl.enable(gl.DEPTH_TEST);
   gl.depthFunc(gl.LEQUAL);
   prog = gl.createProgram();
   
   /*
      add shaders
   */
   function addShader(type, str) {
      var s = gl.createShader(type);
      gl.shaderSource(s, str);
      gl.compileShader(s);
      gl.attachShader(prog, s);
   }
   addShader(gl.VERTEX_SHADER, [
      ,'attribute vec3 aPos;'
      ,'uniform mat4 uMatrix;'
      ,'varying vec3 uPos;'
      ,'void main() {'
      ,'   uPos = aPos* 0.8 + 0.5;'
      ,'   gl_Position = uMatrix * vec4(aPos, 1.);'
      ,'}',
      ].join('\n')
   );
   addShader(gl.FRAGMENT_SHADER, [
      ,'precision highp float;'
      ,'varying vec3 uPos;'
      ,'void main() {'
      ,'   gl_FragColor = vec4(uPos, 1.);'
      ,'}',
      ].join('\n')
   );
   
   /*
      set vertices to buffer
   */

   // cube vertices
   function createCube() {
      var vertices = [
         -.5,-.5, .5,
         -.5, .5, .5,
          .5,-.5, .5,
          .5, .5, .5,
          .5,-.5,-.5,
          .5, .5,-.5,
         -.5,-.5,-.5,
         -.5, .5,-.5,
         -.5,-.5, .5,
         -.5, .5, .5,
      ];
     return vertices;
   }

   // var vertices = createCube();

   // sphere vertices
   function createSphere() {
    var vertices = [];
     var sphereNumV = 10;
     var sphereNumU = 10;
     var radius = 0.2;
     for (var v = 0; v < sphereNumV; v++){
        for (var u = 0; u < sphereNumU; u++){

           // 1
           var phi = pi * v/(sphereNumV-1) - pi/2;
           var theta = 2 * pi * u/(sphereNumU-1);
           var x = Math.cos(phi) * Math.cos(theta) * radius;
           var y = Math.cos(phi) * Math.sin(theta) * radius;
           var z = Math.sin(phi) * radius;
           vertices.push(x);
           vertices.push(y);
           vertices.push(z);

           // 2
           phi = pi * (v+1)/(sphereNumV-1) - pi/2;
           theta = 2 * pi * u/(sphereNumU-1);
           x = Math.cos(phi) * Math.cos(theta) * radius;
           y = Math.cos(phi) * Math.sin(theta) * radius;
           z = Math.sin(phi) * radius;
           vertices.push(x);
           vertices.push(y);
           vertices.push(z);
        }
     }
     return vertices;
   }
   

   // torus vertices
   var vertices = createSphere();
   var torusNumV = 20;
   var torusNumU = 20;
   var r = 0.2;
   var radius = 0.6;
   for (var v = 0; v < torusNumV; v++){
      for (var u = 0; u < torusNumU; u++){

        // 1
        var phi = Math.PI * 2 * v/(torusNumV -1);
        var theta = 2 * Math.PI * u/(torusNumU -1);
        var x = (0.6 + r * Math.cos(phi)) * Math.cos(theta) * radius;
        var y = (0.6 + r * Math.cos(phi)) * Math.sin(theta) * radius;
        var z = r * Math.sin(phi) * radius;
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);

        // 2
        phi = pi * 2 * (v+1)/(torusNumV -1);
        theta = 2 * pi * u/(torusNumU -1);
        x = (0.6 + r * Math.cos(phi)) * Math.cos(theta) * radius;
        y = (0.6 + r * Math.cos(phi)) * Math.sin(theta) * radius;
        z = r * Math.sin(phi) * radius;
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
      }
   }

   // cylinder vertices
   var vertices = [];
   var cyNumV = 20;
   var cyNumU = 20;
   var size = 0.4;
   for (var v = 0; v < cyNumV; v++){
      for (var u = 0; u < cyNumU; u++){
         
        // 1
         var theta = 2 * pi * u/cyNumU;
         var cos = Math.cos(theta) * size;
         var sin = Math.sin(theta) * size;
         vertices.push(sin);
         vertices.push(cos);
         vertices.push((2*v/cyNumV-1)*size);

         // 2
         theta = 2 * pi * u/cyNumU;
         cos = Math.cos(theta) * size;
         sin = Math.sin(theta) * size;
         vertices.push(sin);
         vertices.push(cos);
         vertices.push((2*(v+1)/cyNumV-1)*size);     
      }
   }
   
   //console.log(vertices);
   
   function address(name) { return gl.getUniformLocation(prog, name); }
   gl.linkProgram(prog);
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
   var attr = gl.getAttribLocation(prog, 'aPos');
   gl.enableVertexAttribArray(attr);
   gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 0, 0);
   gl.useProgram(prog);


   /*
      rotate
   */
   setInterval(tick, 1000 / 600);

   function tick() {
      var turn = (new Date()).getTime() / 1000.;
      var cos = Math.cos(turn);
      var sin = Math.sin(turn);
      var adjust = gl.canvas.height / gl.canvas.width;
      var matrix = [ adjust*cos,  0,sin, .1*sin,
                              0,  1,  0,  0,
                    -adjust*sin,  0,cos, .1*cos,
                              0,  0,  0,  1];
      gl.uniformMatrix4fv(address('uMatrix'), false, matrix);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 3);
   }
}



