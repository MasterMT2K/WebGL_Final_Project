class SphereSmf3D extends Drawable {
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
		for (var i = 0; i < SphereSmf3D.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i < SphereSmf3D.indices.length; i += 3) {
			var a = SphereSmf3D.indices[i];
			var b = SphereSmf3D.indices[i + 1];
			var c = SphereSmf3D.indices[i + 2];

			var edge1 = subtract(SphereSmf3D.vertexPositions[b], SphereSmf3D.vertexPositions[a])
			var edge2 = subtract(SphereSmf3D.vertexPositions[c], SphereSmf3D.vertexPositions[b])
			var N = cross(edge1, edge2)

			normalSum[a] = add(normalSum[a], normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b], normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c], normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < SphereSmf3D.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0 / counts[i], normalSum[i]);
	}


    static initialize() {
        SphereSmf3D.computeNormals();
        SphereSmf3D.shaderProgram = initShaders(gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
        // Load the data into the GPU
        SphereSmf3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(SphereSmf3D.vertexPositions), gl.STATIC_DRAW );
        
        SphereSmf3D.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(SphereSmf3D.vertexColors), gl.STATIC_DRAW);

        SphereSmf3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, SphereSmf3D.indexBuffer)
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(SphereSmf3D.indices), gl.STATIC_DRAW );

        SphereSmf3D.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(SphereSmf3D.vertexNormals), gl.STATIC_DRAW)

        SphereSmf3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, SphereSmf3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(SphereSmf3D.vertexPositions), gl.STATIC_DRAW );
        SphereSmf3D.uTextureUnitShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "uTextureUnit");

        // Associate our shader variables with our data buffer
        SphereSmf3D.aPositionShader = gl.getAttribLocation(SphereSmf3D.shaderProgram, "aPosition");
        SphereSmf3D.aColorShader = gl.getAttribLocation(SphereSmf3D.shaderProgram, "aColor")
        SphereSmf3D.aNormalShader = gl.getAttribLocation(SphereSmf3D.shaderProgram, "aNormal");
        SphereSmf3D.aTextureCoordShader = gl.getAttribLocation( SphereSmf3D.shaderProgram, "aTextureCoord" );
        
        SphereSmf3D.uModelMatrixShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "modelMatrix");
        SphereSmf3D.uCameraMatrixShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "cameraMatrix");
        SphereSmf3D.uProjectionMatrixShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "projectionMatrix");
        
		SphereSmf3D.uMatAmbientShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "matAmbient");
		SphereSmf3D.uMatDiffuseShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "matDiffuse");
		SphereSmf3D.uMatSpecularShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "matSpecular");
		SphereSmf3D.uMatAlphaShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "matAlpha");

		SphereSmf3D.uLightDirectionShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "lightDirection");
		SphereSmf3D.uLightAmbientShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "lightAmbient");
		SphereSmf3D.uLightDiffuseShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "lightDiffuse");
		SphereSmf3D.uLightSpecularShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "lightSpecular");

		SphereSmf3D.FlashLightDirectionShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "flashlightDirection");
		SphereSmf3D.FlashLightAmbientShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "flashlightAmbient");
		SphereSmf3D.FlashLightDiffuseShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "flashlightDiffuse");
		SphereSmf3D.FlashLightSpecularShader = gl.getUniformLocation(SphereSmf3D.shaderProgram, "flashlightSpecular");
    }

    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            SphereSmf3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SphereSmf3D.texture);
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
                    SphereSmf3D.vertexPositions.push(v);
                    SphereSmf3D.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
                    break;
                case ('f'):
                    SphereSmf3D.indices.push(parseInt(strings[1]) - 1);
                    SphereSmf3D.indices.push(parseInt(strings[2]) - 1);
                    SphereSmf3D.indices.push(parseInt(strings[3]) - 1);
                    break;
            }
        }
        if (SphereSmf3D.shaderProgram == -1) {
            SphereSmf3D.initialize();
            SphereSmf3D.initializeTexture();
        }
			// console.log(SphereSmf3D.vertexNormals)
			// console.log(SphereSmf3D.vertexColors)
			// console.log(SphereSmf3D.vertexPositions)
			// console.log(SphereSmf3D.indices)
    }

    draw() {
        if(SphereSmf3D.texture == -1)
            return;
        gl.useProgram(SphereSmf3D.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.positionBuffer);
        gl.vertexAttribPointer(SphereSmf3D.aPositionShader, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.colorBuffer);
        gl.vertexAttribPointer(SphereSmf3D.aColorShader, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, SphereSmf3D.normalBuffer);
        gl.vertexAttribPointer(SphereSmf3D.aNormalShader,3, gl.FLOAT, false, 0 , 0)

        gl.bindBuffer( gl.ARRAY_BUFFER, SphereSmf3D.textureCoordBuffer);
        gl.vertexAttribPointer(SphereSmf3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, SphereSmf3D.texture);
        gl.uniform1i(SphereSmf3D.uTextureUnitShader,0);
        
        gl.uniformMatrix4fv(SphereSmf3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(SphereSmf3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(SphereSmf3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));

        gl.uniform4fv(SphereSmf3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(SphereSmf3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(SphereSmf3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(SphereSmf3D.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(SphereSmf3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(SphereSmf3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(SphereSmf3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(SphereSmf3D.uLightSpecularShader, light1.specular);

		gl.uniform3fv(SphereSmf3D.FlashLightDirectionShader, flashlight.direction);
		gl.uniform4fv(SphereSmf3D.FlashLightAmbientShader, flashlight.ambient);
		gl.uniform4fv(SphereSmf3D.FlashLightDiffuseShader, flashlight.diffuse);
		gl.uniform4fv(SphereSmf3D.FlashLightSpecularShader, flashlight.specular);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (SphereSmf3D.indexBuffer));

        gl.enableVertexAttribArray(SphereSmf3D.aPositionShader);
        gl.enableVertexAttribArray(SphereSmf3D.aColorShader);
        gl.enableVertexAttribArray(SphereSmf3D.aNormalShader);
        gl.enableVertexAttribArray(SphereSmf3D.aTextureCoordShader);
        gl.drawElements(gl.TRIANGLES, SphereSmf3D.indices.length,  gl.UNSIGNED_INT, 0);
        gl.disableVertexAttribArray(SphereSmf3D.aPositionShader);
		gl.disableVertexAttribArray(SphereSmf3D.aColorShader);
		gl.disableVertexAttribArray(SphereSmf3D.aNormalShader);
        gl.disableVertexAttribArray(SphereSmf3D.aTextureCoordShader);

    }

}
