class BunnySmf3D extends Drawable {
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
		for (var i = 0; i < BunnySmf3D.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i < BunnySmf3D.indices.length; i += 3) {
			var a = BunnySmf3D.indices[i];
			var b = BunnySmf3D.indices[i + 1];
			var c = BunnySmf3D.indices[i + 2];

			var edge1 = subtract(BunnySmf3D.vertexPositions[b], BunnySmf3D.vertexPositions[a])
			var edge2 = subtract(BunnySmf3D.vertexPositions[c], BunnySmf3D.vertexPositions[b])
			var N = cross(edge1, edge2)

			normalSum[a] = add(normalSum[a], normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b], normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c], normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < BunnySmf3D.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0 / counts[i], normalSum[i]);

		for (var i = 0; i<BunnySmf3D.vertexPositions.length; i++)
            this.vertexColors.push(vec4(1.0, 1.0, 1.0, 1.0));
	}


    static initialize() {
        BunnySmf3D.computeNormals();
        BunnySmf3D.shaderProgram = initShaders(gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
        // Load the data into the GPU
        BunnySmf3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(BunnySmf3D.vertexPositions), gl.STATIC_DRAW );
        
        BunnySmf3D.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(BunnySmf3D.vertexColors), gl.STATIC_DRAW);

        BunnySmf3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BunnySmf3D.indexBuffer)
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(BunnySmf3D.indices), gl.STATIC_DRAW );

        BunnySmf3D.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(BunnySmf3D.vertexNormals), gl.STATIC_DRAW)

        BunnySmf3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, BunnySmf3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(BunnySmf3D.vertexPositions), gl.STATIC_DRAW );
        BunnySmf3D.uTextureUnitShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        BunnySmf3D.aPositionShader = gl.getAttribLocation(BunnySmf3D.shaderProgram, "aPosition");
        BunnySmf3D.aColorShader = gl.getAttribLocation(BunnySmf3D.shaderProgram, "aColor")
        BunnySmf3D.aNormalShader = gl.getAttribLocation(BunnySmf3D.shaderProgram, "aNormal");
        BunnySmf3D.aTextureCoordShader = gl.getAttribLocation( BunnySmf3D.shaderProgram, "aTextureCoord" );
        
        BunnySmf3D.uModelMatrixShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "modelMatrix");
        BunnySmf3D.uCameraMatrixShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "cameraMatrix");
        BunnySmf3D.uProjectionMatrixShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "projectionMatrix");
        
		BunnySmf3D.uMatAmbientShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "matAmbient");
		BunnySmf3D.uMatDiffuseShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "matDiffuse");
		BunnySmf3D.uMatSpecularShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "matSpecular");
		BunnySmf3D.uMatAlphaShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "matAlpha");

		BunnySmf3D.uLightDirectionShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "lightDirection");
		BunnySmf3D.uLightAmbientShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "lightAmbient");
		BunnySmf3D.uLightDiffuseShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "lightDiffuse");
		BunnySmf3D.uLightSpecularShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "lightSpecular");

		BunnySmf3D.FlashLightDirectionShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "flashlightDirection");
		BunnySmf3D.FlashLightAmbientShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "flashlightAmbient");
		BunnySmf3D.FlashLightDiffuseShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "flashlightDiffuse");
		BunnySmf3D.FlashLightSpecularShader = gl.getUniformLocation(BunnySmf3D.shaderProgram, "flashlightSpecular");
    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            BunnySmf3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, BunnySmf3D.texture);
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
                    BunnySmf3D.vertexPositions.push(v);
                    BunnySmf3D.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
                    break;
                case ('f'):
                    BunnySmf3D.indices.push(parseInt(strings[1]) - 1);
                    BunnySmf3D.indices.push(parseInt(strings[2]) - 1);
                    BunnySmf3D.indices.push(parseInt(strings[3]) - 1);
                    break;
            }
        }
        if (BunnySmf3D.shaderProgram == -1) {
            BunnySmf3D.initialize();
            BunnySmf3D.initializeTexture();
        }
			// console.log(BunnySmf3D.vertexNormals)
			// console.log(BunnySmf3D.vertexColors)
			// console.log(BunnySmf3D.vertexPositions)
			// console.log(BunnySmf3D.indices)
    }

    draw() {
        if(BunnySmf3D.texture == -1)
            return;
        gl.useProgram(BunnySmf3D.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.positionBuffer);
        gl.vertexAttribPointer(BunnySmf3D.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.colorBuffer);
        gl.vertexAttribPointer(BunnySmf3D.aColorShader, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, BunnySmf3D.normalBuffer);
        gl.vertexAttribPointer(BunnySmf3D.aNormalShader,3, gl.FLOAT, false, 0 , 0)

        gl.bindBuffer( gl.ARRAY_BUFFER, BunnySmf3D.textureCoordBuffer);
        gl.vertexAttribPointer(BunnySmf3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, BunnySmf3D.texture);
        gl.uniform1i(BunnySmf3D.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(BunnySmf3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(BunnySmf3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(BunnySmf3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));

        gl.uniform4fv(BunnySmf3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(BunnySmf3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(BunnySmf3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(BunnySmf3D.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(BunnySmf3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(BunnySmf3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(BunnySmf3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(BunnySmf3D.uLightSpecularShader, light1.specular);

		gl.uniform3fv(BunnySmf3D.FlashLightDirectionShader, flashlight.direction);
		gl.uniform4fv(BunnySmf3D.FlashLightAmbientShader, flashlight.ambient);
		gl.uniform4fv(BunnySmf3D.FlashLightDiffuseShader, flashlight.diffuse);
		gl.uniform4fv(BunnySmf3D.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (BunnySmf3D.indexBuffer));

        gl.enableVertexAttribArray(BunnySmf3D.aPositionShader);
        gl.enableVertexAttribArray(BunnySmf3D.aColorShader);
        gl.enableVertexAttribArray(BunnySmf3D.aNormalShader);
        gl.enableVertexAttribArray(BunnySmf3D.aTextureCoordShader);
        gl.drawElements(gl.TRIANGLES, BunnySmf3D.indices.length,  gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(BunnySmf3D.aPositionShader);
		gl.disableVertexAttribArray(BunnySmf3D.aColorShader);
		gl.disableVertexAttribArray(BunnySmf3D.aNormalShader);
        gl.disableVertexAttribArray(BunnySmf3D.aTextureCoordShader);

    }

}
