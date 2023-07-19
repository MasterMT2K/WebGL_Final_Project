class FrogSmf3D extends Drawable {
    static vertexPositions = []
    static vertexColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
		vec4(1.0, 0.0, 1.0, 1.0),  // magenta
		vec4(1.0, 1.0, 1.0, 1.0),  // white
		vec4(1.0, 1.0, 0.0, 1.0),  // yellow
		vec4(0.0, 0.0, 0.0, 1.0),  // black
		vec4(0.0, 0.0, 1.0, 1.0),  // blue
		vec4(0.0, 1.0, 1.0, 1.0),  // cyan
		vec4(0.0, 1.0, 0.0, 1.0) 
    ]
    static indices = []
    static vertexNormals = [];


    static shaderProgram = -1;
    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    static textureCoordBuffer = -1;

    static aPositionShader = -1;
    static aColorShader = -1
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
    
    static computeNormals() {
		var normalSum = [];
		var counts = [];

		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i < FrogSmf3D.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i < FrogSmf3D.indices.length; i += 3) {
			var a = FrogSmf3D.indices[i];
			var b = FrogSmf3D.indices[i + 1];
			var c = FrogSmf3D.indices[i + 2];

			var edge1 = subtract(FrogSmf3D.vertexPositions[b], FrogSmf3D.vertexPositions[a])
			var edge2 = subtract(FrogSmf3D.vertexPositions[c], FrogSmf3D.vertexPositions[b])
			var N = cross(edge1, edge2)

			normalSum[a] = add(normalSum[a], normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b], normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c], normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < FrogSmf3D.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0 / counts[i], normalSum[i]);
	}


    static initialize() {
        FrogSmf3D.computeNormals();
        FrogSmf3D.shaderProgram = initShaders(gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
        // Load the data into the GPU
        FrogSmf3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(FrogSmf3D.vertexPositions), gl.STATIC_DRAW );
        
        FrogSmf3D.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(FrogSmf3D.vertexColors), gl.STATIC_DRAW);

        FrogSmf3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, FrogSmf3D.indexBuffer)
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(FrogSmf3D.indices), gl.STATIC_DRAW );

        FrogSmf3D.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(FrogSmf3D.vertexNormals), gl.STATIC_DRAW)

        FrogSmf3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, FrogSmf3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(FrogSmf3D.vertexPositions), gl.STATIC_DRAW );
        FrogSmf3D.uTextureUnitShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        FrogSmf3D.aPositionShader = gl.getAttribLocation(FrogSmf3D.shaderProgram, "aPosition");
        FrogSmf3D.aColorShader = gl.getAttribLocation(FrogSmf3D.shaderProgram, "aColor")
        FrogSmf3D.aNormalShader = gl.getAttribLocation(FrogSmf3D.shaderProgram, "aNormal");
        FrogSmf3D.aTextureCoordShader = gl.getAttribLocation( FrogSmf3D.shaderProgram, "aTextureCoord" );
        
        FrogSmf3D.uModelMatrixShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "modelMatrix");
        FrogSmf3D.uCameraMatrixShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "cameraMatrix");
        FrogSmf3D.uProjectionMatrixShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "projectionMatrix");
        
		FrogSmf3D.uMatAmbientShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "matAmbient");
		FrogSmf3D.uMatDiffuseShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "matDiffuse");
		FrogSmf3D.uMatSpecularShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "matSpecular");
		FrogSmf3D.uMatAlphaShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "matAlpha");

		FrogSmf3D.uLightDirectionShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "lightDirection");
		FrogSmf3D.uLightAmbientShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "lightAmbient");
		FrogSmf3D.uLightDiffuseShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "lightDiffuse");
		FrogSmf3D.uLightSpecularShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "lightSpecular");

		FrogSmf3D.FlashLightDirectionShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "flashlightDirection");
		FrogSmf3D.FlashLightAmbientShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "flashlightAmbient");
		FrogSmf3D.FlashLightDiffuseShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "flashlightDiffuse");
		FrogSmf3D.FlashLightSpecularShader = gl.getUniformLocation(FrogSmf3D.shaderProgram, "flashlightSpecular");
    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            FrogSmf3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, FrogSmf3D.texture);
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

        image.src = "Textures/sky-top.jpg";
    }

	constructor(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh, fname ) {
		super(tx, ty, tz, scale, rotX, rotY, rotZ, amb, dif, sp, sh);

        var smf_file = loadFileAJAX(fname);
        var lines = smf_file.split('\n');
        for (var line = 0; line < lines.length; line++) {
            var strings = lines[line].trimRight().split(' ');
            switch (strings[0]) {
                case ('v'):
                    var v = vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3]));
                    FrogSmf3D.vertexPositions.push(v);
                    FrogSmf3D.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
                    break;
                case ('f'):
                    FrogSmf3D.indices.push(parseInt(strings[1]) - 1);
                    FrogSmf3D.indices.push(parseInt(strings[2]) - 1);
                    FrogSmf3D.indices.push(parseInt(strings[3]) - 1);
                    break;
            }
        }
        if (FrogSmf3D.shaderProgram == -1) {
            FrogSmf3D.initialize();
            FrogSmf3D.initializeTexture();
        }
			// console.log(FrogSmf3D.vertexNormals)
			// console.log(FrogSmf3D.vertexColors)
			// console.log(FrogSmf3D.vertexPositions)
			// console.log(FrogSmf3D.indices)
    }

    draw() {
        if(FrogSmf3D.texture == -1)
            return;
        gl.useProgram(FrogSmf3D.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.positionBuffer);
        gl.vertexAttribPointer(FrogSmf3D.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.colorBuffer);
        gl.vertexAttribPointer(FrogSmf3D.aColorShader, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, FrogSmf3D.normalBuffer);
        gl.vertexAttribPointer(FrogSmf3D.aNormalShader,3, gl.FLOAT, false, 0 , 0)

        gl.bindBuffer( gl.ARRAY_BUFFER, FrogSmf3D.textureCoordBuffer);
        gl.vertexAttribPointer(FrogSmf3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, FrogSmf3D.texture);
        gl.uniform1i(FrogSmf3D.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(FrogSmf3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(FrogSmf3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(FrogSmf3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));

        gl.uniform4fv(FrogSmf3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(FrogSmf3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(FrogSmf3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(FrogSmf3D.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(FrogSmf3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(FrogSmf3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(FrogSmf3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(FrogSmf3D.uLightSpecularShader, light1.specular);

		gl.uniform3fv(FrogSmf3D.FlashLightDirectionShader, flashlight.direction);
		gl.uniform4fv(FrogSmf3D.FlashLightAmbientShader, flashlight.ambient);
		gl.uniform4fv(FrogSmf3D.FlashLightDiffuseShader, flashlight.diffuse);
		gl.uniform4fv(FrogSmf3D.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (FrogSmf3D.indexBuffer));

        gl.enableVertexAttribArray(FrogSmf3D.aPositionShader);
        gl.enableVertexAttribArray(FrogSmf3D.aColorShader);
        gl.enableVertexAttribArray(FrogSmf3D.aNormalShader);
        gl.enableVertexAttribArray(FrogSmf3D.aTextureCoordShader);
        gl.drawElements(gl.TRIANGLES, FrogSmf3D.indices.length,  gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(FrogSmf3D.aPositionShader);
		gl.disableVertexAttribArray(FrogSmf3D.aColorShader);
		gl.disableVertexAttribArray(FrogSmf3D.aNormalShader);
        gl.disableVertexAttribArray(FrogSmf3D.aTextureCoordShader);

    }

}
