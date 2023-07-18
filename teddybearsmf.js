class TeddyBearSmf3D extends Drawable {
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
		for (var i = 0; i < TeddyBearSmf3D.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i < TeddyBearSmf3D.indices.length; i += 3) {
			var a = TeddyBearSmf3D.indices[i];
			var b = TeddyBearSmf3D.indices[i + 1];
			var c = TeddyBearSmf3D.indices[i + 2];

			var edge1 = subtract(TeddyBearSmf3D.vertexPositions[b], TeddyBearSmf3D.vertexPositions[a])
			var edge2 = subtract(TeddyBearSmf3D.vertexPositions[c], TeddyBearSmf3D.vertexPositions[b])
			var N = cross(edge1, edge2)

			normalSum[a] = add(normalSum[a], normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b], normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c], normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < TeddyBearSmf3D.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0 / counts[i], normalSum[i]);
	}


    static initialize() {
        TeddyBearSmf3D.computeNormals();
        TeddyBearSmf3D.shaderProgram = initShaders(gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
        // Load the data into the GPU
        TeddyBearSmf3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(TeddyBearSmf3D.vertexPositions), gl.STATIC_DRAW );
        
        TeddyBearSmf3D.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(TeddyBearSmf3D.vertexColors), gl.STATIC_DRAW);

        TeddyBearSmf3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TeddyBearSmf3D.indexBuffer)
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(TeddyBearSmf3D.indices), gl.STATIC_DRAW );

        TeddyBearSmf3D.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(TeddyBearSmf3D.vertexNormals), gl.STATIC_DRAW)

        TeddyBearSmf3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TeddyBearSmf3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TeddyBearSmf3D.vertexPositions), gl.STATIC_DRAW );
        TeddyBearSmf3D.uTextureUnitShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        TeddyBearSmf3D.aPositionShader = gl.getAttribLocation(TeddyBearSmf3D.shaderProgram, "aPosition");
        TeddyBearSmf3D.aColorShader = gl.getAttribLocation(TeddyBearSmf3D.shaderProgram, "aColor")
        TeddyBearSmf3D.aNormalShader = gl.getAttribLocation(TeddyBearSmf3D.shaderProgram, "aNormal");
        TeddyBearSmf3D.aTextureCoordShader = gl.getAttribLocation( TeddyBearSmf3D.shaderProgram, "aTextureCoord" );
        
        TeddyBearSmf3D.uModelMatrixShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "modelMatrix");
        TeddyBearSmf3D.uCameraMatrixShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "cameraMatrix");
        TeddyBearSmf3D.uProjectionMatrixShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "projectionMatrix");
        
		TeddyBearSmf3D.uMatAmbientShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "matAmbient");
		TeddyBearSmf3D.uMatDiffuseShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "matDiffuse");
		TeddyBearSmf3D.uMatSpecularShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "matSpecular");
		TeddyBearSmf3D.uMatAlphaShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "matAlpha");

		TeddyBearSmf3D.uLightDirectionShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "lightDirection");
		TeddyBearSmf3D.uLightAmbientShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "lightAmbient");
		TeddyBearSmf3D.uLightDiffuseShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "lightDiffuse");
		TeddyBearSmf3D.uLightSpecularShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "lightSpecular");

		TeddyBearSmf3D.FlashLightDirectionShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "flashlightDirection");
		TeddyBearSmf3D.FlashLightAmbientShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "flashlightAmbient");
		TeddyBearSmf3D.FlashLightDiffuseShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "flashlightDiffuse");
		TeddyBearSmf3D.FlashLightSpecularShader = gl.getUniformLocation(TeddyBearSmf3D.shaderProgram, "flashlightSpecular");
    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            TeddyBearSmf3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TeddyBearSmf3D.texture);
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
                    TeddyBearSmf3D.vertexPositions.push(v);
                    TeddyBearSmf3D.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
                    break;
                case ('f'):
                    TeddyBearSmf3D.indices.push(parseInt(strings[1]) - 1);
                    TeddyBearSmf3D.indices.push(parseInt(strings[2]) - 1);
                    TeddyBearSmf3D.indices.push(parseInt(strings[3]) - 1);
                    break;
            }
        }
        if (TeddyBearSmf3D.shaderProgram == -1) {
            TeddyBearSmf3D.initialize();
            TeddyBearSmf3D.initializeTexture();
        }
			// console.log(TeddyBearSmf3D.vertexNormals)
			// console.log(TeddyBearSmf3D.vertexColors)
			// console.log(TeddyBearSmf3D.vertexPositions)
			// console.log(TeddyBearSmf3D.indices)
    }

    draw() {
        if(TeddyBearSmf3D.texture == -1)
            return;
        gl.useProgram(TeddyBearSmf3D.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.positionBuffer);
        gl.vertexAttribPointer(TeddyBearSmf3D.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.colorBuffer);
        gl.vertexAttribPointer(TeddyBearSmf3D.aColorShader, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, TeddyBearSmf3D.normalBuffer);
        gl.vertexAttribPointer(TeddyBearSmf3D.aNormalShader,3, gl.FLOAT, false, 0 , 0)

        gl.bindBuffer( gl.ARRAY_BUFFER, TeddyBearSmf3D.textureCoordBuffer);
        gl.vertexAttribPointer(TeddyBearSmf3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, TeddyBearSmf3D.texture);
        gl.uniform1i(TeddyBearSmf3D.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(TeddyBearSmf3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TeddyBearSmf3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(TeddyBearSmf3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));

        gl.uniform4fv(TeddyBearSmf3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(TeddyBearSmf3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(TeddyBearSmf3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(TeddyBearSmf3D.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(TeddyBearSmf3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(TeddyBearSmf3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(TeddyBearSmf3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(TeddyBearSmf3D.uLightSpecularShader, light1.specular);

		gl.uniform3fv(TeddyBearSmf3D.FlashLightDirectionShader, flashlight.direction);
		gl.uniform4fv(TeddyBearSmf3D.FlashLightAmbientShader, flashlight.ambient);
		gl.uniform4fv(TeddyBearSmf3D.FlashLightDiffuseShader, flashlight.diffuse);
		gl.uniform4fv(TeddyBearSmf3D.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (TeddyBearSmf3D.indexBuffer));

        gl.enableVertexAttribArray(TeddyBearSmf3D.aPositionShader);
        gl.enableVertexAttribArray(TeddyBearSmf3D.aColorShader);
        gl.enableVertexAttribArray(TeddyBearSmf3D.aNormalShader);
        gl.enableVertexAttribArray(TeddyBearSmf3D.aTextureCoordShader);
        gl.drawElements(gl.TRIANGLES, TeddyBearSmf3D.indices.length,  gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(TeddyBearSmf3D.aPositionShader);
		gl.disableVertexAttribArray(TeddyBearSmf3D.aColorShader);
		gl.disableVertexAttribArray(TeddyBearSmf3D.aNormalShader);
        gl.disableVertexAttribArray(TeddyBearSmf3D.aTextureCoordShader);

    }

}
