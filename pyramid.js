class Pyramid extends Drawable{
    static vertexPositions = [
        vec3( 0, 2, 0 ),
        vec3(  -1,  0, -1 ),
        vec3(  1, 0, -1 ),
        vec3(  -1,  0, 1 ),
        vec3(  1,  0, 1 )];

    static vertexColors = [
        vec4(1,0,1,1), // fuchsia
        vec4(0,1, 1,1), // aqua
        vec4(0, 0,1,1), // blue
        vec4(1,0,0,1), // red
        vec4(1,1,0,1) // yellow
    ];

    static vertexNormals = [];

    static indices = [
        0,1,2,
        0,1,3,
        0,3,4,
        0,4,2,
        1,2,3,
        2,3,4
    ];

    static vertexTextureCoords = [
        vec3(0,2,0),
        vec3(-1,0,-1),
        vec3(1,0,-1),
        vec3(-1,0,1),
        vec3(1,0,1)
    ];

    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    static textureCoordBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aColorShader = -1;
    static aNormalShader = -1;
    static aTextureCoordShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatAmbientShader = -1;
    static uMatDiffuseShader = -1;
    static uMatSpecularShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightAmbientShader = -1;
    static uLightDiffuseShader = -1;
    static uLightSpecularShader = -1;

    static FlashLightDirectionShader = -1;
    static FlashLightAmbientShader = -1;
    static FlashLightDiffuseShader = -1;
    static FlashLightSpecularShader = -1;

    static texture = -1;
    static uTextureUnitShader = -1;

    static computeNormals(){
        var normalSum = [];
        var counts = [];

        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<Pyramid.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }

        //for each triangle
        for (var i = 0; i<Pyramid.indices.length; i+=3) {
            var a = Pyramid.indices[i];
            var b = Pyramid.indices[i+1];
            var c = Pyramid.indices[i+2];

            var edge1 = subtract(Pyramid.vertexPositions[b],Pyramid.vertexPositions[a])
            var edge2 = subtract(Pyramid.vertexPositions[c],Pyramid.vertexPositions[b])
            var N = cross(edge1,edge2)

            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;

        }
        
        for (var i = 0; i < Pyramid.vertexPositions.length; i++)
            this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

    static initialize() {
        Pyramid.computeNormals();
        Pyramid.shaderProgram = initShaders( gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");

        // Load the data into the GPU
        Pyramid.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Pyramid.vertexPositions), gl.STATIC_DRAW );

        Pyramid.colorBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.colorBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Pyramid.vertexColors), gl.STATIC_DRAW );

        Pyramid.normalBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.normalBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Pyramid.vertexNormals), gl.STATIC_DRAW );

        Pyramid.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Pyramid.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Pyramid.indices), gl.STATIC_DRAW );

        Pyramid.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Pyramid.vertexTextureCoords), gl.STATIC_DRAW );
        Pyramid.uTextureUnitShader = gl.getUniformLocation(Pyramid.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        Pyramid.aPositionShader = gl.getAttribLocation( Pyramid.shaderProgram, "aPosition" );
        Pyramid.aColorShader = gl.getAttribLocation( Pyramid.shaderProgram, "aColor");
        Pyramid.aNormalShader = gl.getAttribLocation( Pyramid.shaderProgram, "aNormal" );
        Pyramid.aTextureCoordShader = gl.getAttribLocation( Pyramid.shaderProgram, "aTextureCoord" );

        Pyramid.uModelMatrixShader = gl.getUniformLocation( Pyramid.shaderProgram, "modelMatrix" );
        Pyramid.uCameraMatrixShader = gl.getUniformLocation( Pyramid.shaderProgram, "cameraMatrix" );
        Pyramid.uProjectionMatrixShader = gl.getUniformLocation( Pyramid.shaderProgram, "projectionMatrix" );
        
        Pyramid.uMatAmbientShader = gl.getUniformLocation( Pyramid.shaderProgram, "matAmbient" );
        Pyramid.uMatDiffuseShader = gl.getUniformLocation( Pyramid.shaderProgram, "matDiffuse" );
        Pyramid.uMatSpecularShader = gl.getUniformLocation( Pyramid.shaderProgram, "matSpecular" );
        Pyramid.uMatAlphaShader = gl.getUniformLocation( Pyramid.shaderProgram, "matAlpha" );

        Pyramid.uLightDirectionShader = gl.getUniformLocation( Pyramid.shaderProgram, "lightDirection" );
        Pyramid.uLightAmbientShader = gl.getUniformLocation( Pyramid.shaderProgram, "lightAmbient" );
        Pyramid.uLightDiffuseShader = gl.getUniformLocation( Pyramid.shaderProgram, "lightDiffuse" );
        Pyramid.uLightSpecularShader = gl.getUniformLocation( Pyramid.shaderProgram, "lightSpecular" );

        Pyramid.FlashLightDirectionShader = gl.getUniformLocation( Pyramid.shaderProgram, "flashlightDirection" );
        Pyramid.FlashLightAmbientShader = gl.getUniformLocation( Pyramid.shaderProgram, "flashlightAmbient" );
        Pyramid.FlashLightDiffuseShader = gl.getUniformLocation( Pyramid.shaderProgram, "flashlightDiffuse" );
        Pyramid.FlashLightSpecularShader = gl.getUniformLocation( Pyramid.shaderProgram, "flashlightSpecular" );

    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Pyramid.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Pyramid.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }

        image.src = "Textures/question_block.png";
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Pyramid.shaderProgram == -1) {
            Pyramid.initialize();
            Pyramid.initializeTexture();
        }
            
    }

    draw() {
        if (Pyramid.texture == -1)
            return;
        // draw pyramid body
        gl.useProgram(Pyramid.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.positionBuffer);
        gl.vertexAttribPointer(Pyramid.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.colorBuffer);
        gl.vertexAttribPointer(Pyramid.aColorShader, 4, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.normalBuffer);
        gl.vertexAttribPointer(Pyramid.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Pyramid.textureCoordBuffer);
        gl.vertexAttribPointer(Pyramid.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Pyramid.texture);
        //gl.bindTexture(gl.TEXTURE_2D, Pyramid.texture);
        gl.uniform1i(Pyramid.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(Pyramid.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Pyramid.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Pyramid.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Pyramid.uMatAmbientShader, this.matAmbient);
        gl.uniform4fv(Pyramid.uMatDiffuseShader, this.matDiffuse);
        gl.uniform4fv(Pyramid.uMatSpecularShader, this.matSpecular);
        gl.uniform1f(Pyramid.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Pyramid.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Pyramid.uLightAmbientShader, light1.ambient);
        gl.uniform4fv(Pyramid.uLightDiffuseShader, light1.diffuse);
        gl.uniform4fv(Pyramid.uLightSpecularShader, light1.specular);

        gl.uniform3fv(Pyramid.FlashLightDirectionShader, flashlight.direction);
        gl.uniform4fv(Pyramid.FlashLightAmbientShader, flashlight.ambient);
        gl.uniform4fv(Pyramid.FlashLightDiffuseShader, flashlight.diffuse);
        gl.uniform4fv(Pyramid.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Pyramid.indexBuffer);

        gl.enableVertexAttribArray(Pyramid.aPositionShader);
        gl.enableVertexAttribArray(Pyramid.aColorShader);
        gl.enableVertexAttribArray(Pyramid.aNormalShader);
        gl.enableVertexAttribArray(Pyramid.aTextureCoordShader);
        gl.drawElements( gl.TRIANGLE_FAN, Pyramid.indices.length, gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(Pyramid.aPositionShader);
        gl.disableVertexAttribArray(Pyramid.aColorShader);
        gl.disableVertexAttribArray(Pyramid.aNormalShader);
        gl.disableVertexAttribArray(Pyramid.aTextureCoordShader);


    }
}