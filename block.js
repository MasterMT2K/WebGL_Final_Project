class Block3D extends Drawable{
    static vertexPositions = [
    	vec3(-0.5,-0.5,0.5),
    	vec3(-0.5,0.5,0.5),
    	vec3(0.5,0.5,0.5),
    	vec3(0.5,-0.5,0.5),
    	vec3(-0.5,-0.5,-0.5),
    	vec3(-0.5,0.5,-0.5),
    	vec3(0.5,0.5,-0.5),
    	vec3(0.5,-0.5,-0.5),
    ];
   static vertexColors = [
		vec4(1.0, 0.0, 0.0, 1.0),  // red
		vec4(1.0, 0.0, 1.0, 1.0),  // magenta
		vec4(1.0, 1.0, 1.0, 1.0),  // white
		vec4(1.0, 1.0, 0.0, 1.0),  // yellow
		vec4(0.0, 0.0, 0.0, 1.0),  // black
		vec4(0.0, 0.0, 1.0, 1.0),  // blue
		vec4(0.0, 1.0, 1.0, 1.0),  // cyan
		vec4(0.0, 1.0, 0.0, 1.0)   // green
    ];
    
    static vertexNormals = [];

    static indices = [
		0,3,2,
		0,2,1,
		2,3,7,
		2,7,6, 
		0,4,7,
		0,7,3,
		1,2,6,
		1,6,5,
		4,5,6,
		4,6,7,
		0,1,5,
		0,5,4
    ];

	static vertexTextureCoords = [			
		// vec3(1,1,1),
        // vec3(1,-1,1),
        // vec3(-1,-1,1),
        // vec3(-1,1,1),
        // vec3(1,1,-1),
        // vec3(1,-1,-1),
        // vec3(-1,-1,-1),
        // vec3(1,-1,-1)

		vec3(-1,1,1),
		vec3(-1,-1,1),
		vec3(1,-1,1),
		vec3(1,1,1),
        vec3(-1,1,-1),
		vec3(-1,-1,-1),
		vec3(1,-1,-1),
		vec3(1,1,-1)
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

	static smAPositionShader = -1;
	static smModelMatrixShader = -1;
	static smCameraMatrixShader = -1;
	static smProjectionMatrixShader = -1;
	static smMaxDepthShader = -1;

	static lightMatrixShader = -1;

    static computeNormals(){
	var normalSum = [];
	var counts = [];
	
	//initialize sum of normals for each vertex and how often its used.
	for (var i = 0; i<Block3D.vertexPositions.length; i++) {
	    normalSum.push(vec3(0, 0, 0));
	    counts.push(0);
	}
	
	//for each triangle
	for (var i = 0; i<Block3D.indices.length; i+=3) {
	    var a = Block3D.indices[i];
	    var b = Block3D.indices[i+1];
	    var c = Block3D.indices[i+2];
	    
	    var edge1 = subtract(Block3D.vertexPositions[b],Block3D.vertexPositions[a])
	    var edge2 = subtract(Block3D.vertexPositions[c],Block3D.vertexPositions[b])
	    var N = cross(edge1,edge2)
	    
	    normalSum[a] = add(normalSum[a],normalize(N));
	    counts[a]++;
	    normalSum[b] = add(normalSum[b],normalize(N));
	    counts[b]++;
	    normalSum[c] = add(normalSum[c],normalize(N));
	    counts[c]++;
	
	}

	for (var i = 0; i < Block3D.vertexPositions.length; i++)
	    this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
		//console.log("cube ", this.vertexNormals);
    }

    static initialize() {
        Block3D.computeNormals();
    	Block3D.shaderProgram = initShaders( gl, "/Shaders/vshaderCube.glsl", "/Shaders/fshaderCube.glsl");

		// Load the data into the GPU
		Block3D.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Block3D.vertexPositions), gl.STATIC_DRAW );
		
		Block3D.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Block3D.vertexColors), gl.STATIC_DRAW );
		
		Block3D.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Block3D.vertexNormals), gl.STATIC_DRAW );
		
		Block3D.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Block3D.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Block3D.indices), gl.STATIC_DRAW );
			
		Block3D.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.textureCoordBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Block3D.vertexTextureCoords), gl.STATIC_DRAW );
		Block3D.uTextureUnitShader = gl.getUniformLocation(Block3D.shaderProgram, "uTextureUnit");

		// Associate our shader variables with our data buffer
		Block3D.aPositionShader = gl.getAttribLocation( Block3D.shaderProgram, "aPosition" );
		Block3D.aColorShader = gl.getAttribLocation( Block3D.shaderProgram, "aColor" );
		Block3D.aNormalShader = gl.getAttribLocation( Block3D.shaderProgram, "aNormal" );
		Block3D.aTextureCoordShader = gl.getAttribLocation( Block3D.shaderProgram, "aTextureCoord" );

		Block3D.uModelMatrixShader = gl.getUniformLocation( Block3D.shaderProgram, "modelMatrix" );
		Block3D.uCameraMatrixShader = gl.getUniformLocation( Block3D.shaderProgram, "cameraMatrix" );
		Block3D.uProjectionMatrixShader = gl.getUniformLocation( Block3D.shaderProgram, "projectionMatrix" );
		
		Block3D.uMatAmbientShader = gl.getUniformLocation( Block3D.shaderProgram, "matAmbient" );
		Block3D.uMatDiffuseShader = gl.getUniformLocation( Block3D.shaderProgram, "matDiffuse" );
		Block3D.uMatSpecularShader = gl.getUniformLocation( Block3D.shaderProgram, "matSpecular" );
		Block3D.uMatAlphaShader = gl.getUniformLocation( Block3D.shaderProgram, "matAlpha" );
		
		Block3D.uLightDirectionShader = gl.getUniformLocation( Block3D.shaderProgram, "lightDirection" );
		Block3D.uLightAmbientShader = gl.getUniformLocation( Block3D.shaderProgram, "lightAmbient" );
		Block3D.uLightDiffuseShader = gl.getUniformLocation( Block3D.shaderProgram, "lightDiffuse" );
		Block3D.uLightSpecularShader = gl.getUniformLocation( Block3D.shaderProgram, "lightSpecular" );

		Block3D.FlashLightDirectionShader = gl.getUniformLocation( Block3D.shaderProgram, "flashlightDirection" );
		Block3D.FlashLightAmbientShader = gl.getUniformLocation( Block3D.shaderProgram, "flashlightAmbient" );
		Block3D.FlashLightDiffuseShader = gl.getUniformLocation( Block3D.shaderProgram, "flashlightDiffuse" );
		Block3D.FlashLightSpecularShader = gl.getUniformLocation( Block3D.shaderProgram, "flashlightSpecular" );
	}
    	
    static initializeTexture(){
        var image = new Image();


		image.onload = function(){
            Block3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Block3D.texture);            
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
		var walk = true;
		var dark = true;
        if(Block3D.shaderProgram == -1) {
			Block3D.initialize();
			Block3D.initializeTexture();
		}
        
    }
    
    draw() {
	if(Block3D.texture == -1)  //only draw when texture is loaded.
		return;
		
    gl.useProgram(Block3D.shaderProgram);
        
    gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.positionBuffer);
    gl.vertexAttribPointer(Block3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
    gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.colorBuffer);
   	gl.vertexAttribPointer(Block3D.aColorShader, 4, gl.FLOAT, false, 0, 0 );
       	
   	gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.normalBuffer);
  	gl.vertexAttribPointer(Block3D.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
    
	gl.bindBuffer( gl.ARRAY_BUFFER, Block3D.textureCoordBuffer);
	gl.vertexAttribPointer(Block3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 ); 



	gl.uniformMatrix4fv(Block3D.uModelMatrixShader, false, flatten(this.modelMatrix));
	gl.uniformMatrix4fv(Block3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
	gl.uniformMatrix4fv(Block3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));

	// gl.activeTexture(gl.TEXTURE1);
	// gl.bindTexture(gl.TEXTURE_2D, light1.depthTexture);
	// gl.uniform1i(Block3D.dt_loc, 1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Block3D.texture);
	gl.uniform1i(Block3D.uTextureUnitShader,0);

	gl.uniform4fv(Block3D.uMatAmbientShader, this.matAmbient);
	gl.uniform4fv(Block3D.uMatDiffuseShader, this.matDiffuse);
	gl.uniform4fv(Block3D.uMatSpecularShader, this.matSpecular);
	gl.uniform1f(Block3D.uMatAlphaShader, this.matAlpha);
	
	gl.uniform3fv(Block3D.uLightDirectionShader, light1.direction);
	gl.uniform4fv(Block3D.uLightAmbientShader, light1.ambient);
	gl.uniform4fv(Block3D.uLightDiffuseShader, light1.diffuse);
	gl.uniform4fv(Block3D.uLightSpecularShader, light1.specular);

	gl.uniform3fv(Block3D.FlashLightDirectionShader, flashlight.direction);
	gl.uniform4fv(Block3D.FlashLightAmbientShader, flashlight.ambient);
	gl.uniform4fv(Block3D.FlashLightDiffuseShader, flashlight.diffuse);
	gl.uniform4fv(Block3D.FlashLightSpecularShader, flashlight.specular);
		
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Block3D.indexBuffer);
	
	gl.enableVertexAttribArray(Block3D.aPositionShader);    
	gl.enableVertexAttribArray(Block3D.aColorShader);
	gl.enableVertexAttribArray(Block3D.aNormalShader);  
	gl.enableVertexAttribArray(Block3D.aTextureCoordShader);    
	gl.drawElements(gl.TRIANGLES, Block3D.indices.length, gl.UNSIGNED_BYTE, 0);
	gl.disableVertexAttribArray(Block3D.aPositionShader);    
	gl.disableVertexAttribArray(Block3D.aColorShader);    
	gl.disableVertexAttribArray(Block3D.aNormalShader);    
	gl.disableVertexAttribArray(Block3D.aTextureCoordShader);    
    }

	useDark() {
        if (this.dark) {
            Block3D.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshaderDark.glsl");
            gl.useProgram(Block3D.shaderProgram);
            this.dark = false;
        } else {
            Block3D.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");
            gl.useProgram(Block3D.shaderProgram);
            this.dark = true;
        }
    }

}

