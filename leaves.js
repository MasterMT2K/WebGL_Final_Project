class Leaves extends Drawable{
    static vertexPositions = [
        vec3( 0, 2, 0 ),
        vec3(  -1,  0, -1 ),
        vec3(  1, 0, -1 ),
        vec3(  -1,  0, 1 ),
        vec3(  1,  0, 1 )];

    static vertexColors = [
        vec4(0,1,0,1), // green
        vec4(0,1,0,1), // green
        vec4(0,1,0,1), // green
        vec4(0,1,0,1), // green
        vec4(0,1,0,1) // green
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
        for (var i = 0; i<Leaves.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }

        //for each triangle
        for (var i = 0; i<Leaves.indices.length; i+=3) {
            var a = Leaves.indices[i];
            var b = Leaves.indices[i+1];
            var c = Leaves.indices[i+2];

            var edge1 = subtract(Leaves.vertexPositions[b],Leaves.vertexPositions[a])
            var edge2 = subtract(Leaves.vertexPositions[c],Leaves.vertexPositions[b])
            var N = cross(edge1,edge2)

            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;

        }
        
        for (var i = 0; i < Leaves.vertexPositions.length; i++)
            this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

    static initialize() {
        Leaves.computeNormals();
        Leaves.shaderProgram = initShaders( gl, "/Shaders/vshaderCube.glsl", "/Shaders/fshaderCube.glsl");

        // Load the data into the GPU
        Leaves.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Leaves.vertexPositions), gl.STATIC_DRAW );

        Leaves.colorBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.colorBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Leaves.vertexColors), gl.STATIC_DRAW );

        Leaves.normalBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.normalBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Leaves.vertexNormals), gl.STATIC_DRAW );

        Leaves.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Leaves.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Leaves.indices), gl.STATIC_DRAW );

        Leaves.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Leaves.vertexTextureCoords), gl.STATIC_DRAW );
        Leaves.uTextureUnitShader = gl.getUniformLocation(Leaves.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        Leaves.aPositionShader = gl.getAttribLocation( Leaves.shaderProgram, "aPosition" );
        Leaves.aColorShader = gl.getAttribLocation( Leaves.shaderProgram, "aColor");
        Leaves.aNormalShader = gl.getAttribLocation( Leaves.shaderProgram, "aNormal" );
        Leaves.aTextureCoordShader = gl.getAttribLocation( Leaves.shaderProgram, "aTextureCoord" );

        Leaves.uModelMatrixShader = gl.getUniformLocation( Leaves.shaderProgram, "modelMatrix" );
        Leaves.uCameraMatrixShader = gl.getUniformLocation( Leaves.shaderProgram, "cameraMatrix" );
        Leaves.uProjectionMatrixShader = gl.getUniformLocation( Leaves.shaderProgram, "projectionMatrix" );
        
        Leaves.uMatAmbientShader = gl.getUniformLocation( Leaves.shaderProgram, "matAmbient" );
        Leaves.uMatDiffuseShader = gl.getUniformLocation( Leaves.shaderProgram, "matDiffuse" );
        Leaves.uMatSpecularShader = gl.getUniformLocation( Leaves.shaderProgram, "matSpecular" );
        Leaves.uMatAlphaShader = gl.getUniformLocation( Leaves.shaderProgram, "matAlpha" );

        Leaves.uLightDirectionShader = gl.getUniformLocation( Leaves.shaderProgram, "lightDirection" );
        Leaves.uLightAmbientShader = gl.getUniformLocation( Leaves.shaderProgram, "lightAmbient" );
        Leaves.uLightDiffuseShader = gl.getUniformLocation( Leaves.shaderProgram, "lightDiffuse" );
        Leaves.uLightSpecularShader = gl.getUniformLocation( Leaves.shaderProgram, "lightSpecular" );

        Leaves.FlashLightDirectionShader = gl.getUniformLocation( Leaves.shaderProgram, "flashlightDirection" );
        Leaves.FlashLightAmbientShader = gl.getUniformLocation( Leaves.shaderProgram, "flashlightAmbient" );
        Leaves.FlashLightDiffuseShader = gl.getUniformLocation( Leaves.shaderProgram, "flashlightDiffuse" );
        Leaves.FlashLightSpecularShader = gl.getUniformLocation( Leaves.shaderProgram, "flashlightSpecular" );

    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Leaves.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Leaves.texture);
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

        image.src = "Textures/leaves.png";
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Leaves.shaderProgram == -1) {
            Leaves.initialize();
            Leaves.initializeTexture();
        }
            
    }

    draw() {
        if (Leaves.texture == -1)
            return;
        // draw Leaves body
        gl.useProgram(Leaves.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.positionBuffer);
        gl.vertexAttribPointer(Leaves.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.colorBuffer);
        gl.vertexAttribPointer(Leaves.aColorShader, 4, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.normalBuffer);
        gl.vertexAttribPointer(Leaves.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Leaves.textureCoordBuffer);
        gl.vertexAttribPointer(Leaves.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Leaves.texture);
        //gl.bindTexture(gl.TEXTURE_2D, Leaves.texture);
        gl.uniform1i(Leaves.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(Leaves.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Leaves.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Leaves.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Leaves.uMatAmbientShader, this.matAmbient);
        gl.uniform4fv(Leaves.uMatDiffuseShader, this.matDiffuse);
        gl.uniform4fv(Leaves.uMatSpecularShader, this.matSpecular);
        gl.uniform1f(Leaves.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Leaves.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Leaves.uLightAmbientShader, light1.ambient);
        gl.uniform4fv(Leaves.uLightDiffuseShader, light1.diffuse);
        gl.uniform4fv(Leaves.uLightSpecularShader, light1.specular);

        gl.uniform3fv(Leaves.FlashLightDirectionShader, flashlight.direction);
        gl.uniform4fv(Leaves.FlashLightAmbientShader, flashlight.ambient);
        gl.uniform4fv(Leaves.FlashLightDiffuseShader, flashlight.diffuse);
        gl.uniform4fv(Leaves.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Leaves.indexBuffer);

        gl.enableVertexAttribArray(Leaves.aPositionShader);
        gl.enableVertexAttribArray(Leaves.aColorShader);
        gl.enableVertexAttribArray(Leaves.aNormalShader);
        gl.enableVertexAttribArray(Leaves.aTextureCoordShader);
        gl.drawElements( gl.TRIANGLE_FAN, Leaves.indices.length, gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(Leaves.aPositionShader);
        gl.disableVertexAttribArray(Leaves.aColorShader);
        gl.disableVertexAttribArray(Leaves.aNormalShader);
        gl.disableVertexAttribArray(Leaves.aTextureCoordShader);


    }
}