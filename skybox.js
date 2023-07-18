class SkyBox3D extends Drawable{
    static vertexPositions = [
		vec3(-5,-5,5),
    	vec3(-5,5,5),
    	vec3(5,5,5),
    	vec3(5,-5,5),
    	vec3(-5,-5,-5),
    	vec3(-5,5,-5),
    	vec3(5,5,-5),
    	vec3(5,-5,-5),

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

    static computeNormals(){
	var normalSum = [];
	var counts = [];
	
	//initialize sum of normals for each vertex and how often its used.
	for (var i = 0; i<SkyBox3D.vertexPositions.length; i++) {
	    normalSum.push(vec3(0, 0, 0));
	    counts.push(0);
	}
	
	//for each triangle
	for (var i = 0; i<SkyBox3D.indices.length; i+=3) {
	    var a = SkyBox3D.indices[i];
	    var b = SkyBox3D.indices[i+1];
	    var c = SkyBox3D.indices[i+2];
	    
	    var edge1 = subtract(SkyBox3D.vertexPositions[b],SkyBox3D.vertexPositions[a])
	    var edge2 = subtract(SkyBox3D.vertexPositions[c],SkyBox3D.vertexPositions[b])
	    var N = cross(edge1,edge2)
	    
	    normalSum[a] = add(normalSum[a],normalize(N));
	    counts[a]++;
	    normalSum[b] = add(normalSum[b],normalize(N));
	    counts[b]++;
	    normalSum[c] = add(normalSum[c],normalize(N));
	    counts[c]++;
	
	}

	for (var i = 0; i < SkyBox3D.vertexPositions.length; i++)
	    this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
		//console.log("cube ", this.vertexNormals);
    }

    static initialize() {
        SkyBox3D.computeNormals();
    	SkyBox3D.shaderProgram = initShaders( gl, "/Shaders/vshaderCube.glsl", "/Shaders/fshaderCube.glsl");
		
		// Load the data into the GPU
		SkyBox3D.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SkyBox3D.vertexPositions), gl.STATIC_DRAW );
		
		SkyBox3D.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SkyBox3D.vertexColors), gl.STATIC_DRAW );
		
		SkyBox3D.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SkyBox3D.vertexNormals), gl.STATIC_DRAW );
		
		SkyBox3D.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SkyBox3D.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(SkyBox3D.indices), gl.STATIC_DRAW );
			
		SkyBox3D.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.textureCoordBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SkyBox3D.vertexTextureCoords), gl.STATIC_DRAW );
		SkyBox3D.uTextureUnitShader = gl.getUniformLocation(SkyBox3D.shaderProgram, "uTextureUnit");

		// Associate our shader variables with our data buffer
		SkyBox3D.aPositionShader = gl.getAttribLocation( SkyBox3D.shaderProgram, "aPosition" );
		SkyBox3D.aColorShader = gl.getAttribLocation( SkyBox3D.shaderProgram, "aColor" );
		SkyBox3D.aNormalShader = gl.getAttribLocation( SkyBox3D.shaderProgram, "aNormal" );
		SkyBox3D.aTextureCoordShader = gl.getAttribLocation( SkyBox3D.shaderProgram, "aTextureCoord" );

		SkyBox3D.uModelMatrixShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "modelMatrix" );
		SkyBox3D.uCameraMatrixShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "cameraMatrix" );
		SkyBox3D.uProjectionMatrixShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "projectionMatrix" );
		
		SkyBox3D.uMatAmbientShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "matAmbient" );
		SkyBox3D.uMatDiffuseShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "matDiffuse" );
		SkyBox3D.uMatSpecularShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "matSpecular" );
		SkyBox3D.uMatAlphaShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "matAlpha" );
		
		SkyBox3D.uLightDirectionShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "lightDirection" );
		SkyBox3D.uLightAmbientShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "lightAmbient" );
		SkyBox3D.uLightDiffuseShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "lightDiffuse" );
		SkyBox3D.uLightSpecularShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "lightSpecular" );

		SkyBox3D.FlashLightDirectionShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "flashlightDirection" );
		SkyBox3D.FlashLightAmbientShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "flashlightAmbient" );
		SkyBox3D.FlashLightDiffuseShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "flashlightDiffuse" );
		SkyBox3D.FlashLightSpecularShader = gl.getUniformLocation( SkyBox3D.shaderProgram, "flashlightSpecular" );
		
    }
    	
    static initializeTexture(){
		var image = new Image();
		var image2 = new Image();
		var image3 = new Image();
		var image4 = new Image();
		var image5 = new Image();
		var image6 = new Image();

		image6.onload = function(){
            SkyBox3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyBox3D.texture);            
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image2.width, image2.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image2);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image3.width, image3.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image3);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image4.width, image4.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image4);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image5.width, image5.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image5);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image6.width, image6.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image6);
			
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }
        
        image.src = "Textures/sky-top.jpg";
		image2.src = "Textures/sky-bottom.jpg";
		image3.src = "Textures/sky-right.jpg";
		image4.src = "Textures/sky-left.jpg";
		image5.src = "Textures/sky-front.jpg";
		image6.src = "Textures/sky-back.jpg";
	}

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(SkyBox3D.shaderProgram == -1)
            SkyBox3D.initialize()
			SkyBox3D.initializeTexture();
    }
    
    draw() {
		if(SkyBox3D.texture == -1)  //only draw when texture is loaded.
		return;
    
    gl.useProgram(SkyBox3D.shaderProgram);
        
    gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.positionBuffer);
    gl.vertexAttribPointer(SkyBox3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
    gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.colorBuffer);
   	gl.vertexAttribPointer(SkyBox3D.aColorShader, 4, gl.FLOAT, false, 0, 0 );
       	
   	gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.normalBuffer);
  	gl.vertexAttribPointer(SkyBox3D.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
    
	gl.bindBuffer( gl.ARRAY_BUFFER, SkyBox3D.textureCoordBuffer);
	gl.vertexAttribPointer(SkyBox3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 ); 

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyBox3D.texture);
	gl.uniform1i(SkyBox3D.uTextureUnitShader,0);

	gl.uniformMatrix4fv(SkyBox3D.uModelMatrixShader, false, flatten(this.modelMatrix));
	gl.uniformMatrix4fv(SkyBox3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
	gl.uniformMatrix4fv(SkyBox3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));
	
	gl.uniform4fv(SkyBox3D.uMatAmbientShader, this.matAmbient);
	gl.uniform4fv(SkyBox3D.uMatDiffuseShader, this.matDiffuse);
	gl.uniform4fv(SkyBox3D.uMatSpecularShader, this.matSpecular);
	gl.uniform1f(SkyBox3D.uMatAlphaShader, this.matAlpha);
	
	gl.uniform3fv(SkyBox3D.uLightDirectionShader, light1.direction);
	gl.uniform4fv(SkyBox3D.uLightAmbientShader, light1.ambient);
	gl.uniform4fv(SkyBox3D.uLightDiffuseShader, light1.diffuse);
	gl.uniform4fv(SkyBox3D.uLightSpecularShader, light1.specular);

	gl.uniform3fv(SkyBox3D.FlashLightDirectionShader, flashlight.direction);
	gl.uniform4fv(SkyBox3D.FlashLightAmbientShader, flashlight.ambient);
	gl.uniform4fv(SkyBox3D.FlashLightDiffuseShader, flashlight.diffuse);
	gl.uniform4fv(SkyBox3D.FlashLightSpecularShader, flashlight.specular);
		
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SkyBox3D.indexBuffer);
	
	gl.enableVertexAttribArray(SkyBox3D.aPositionShader);    
	gl.enableVertexAttribArray(SkyBox3D.aColorShader);
	gl.enableVertexAttribArray(SkyBox3D.aNormalShader);  
	gl.enableVertexAttribArray(SkyBox3D.aTextureCoordShader);    
	gl.drawElements(gl.TRIANGLES, SkyBox3D.indices.length, gl.UNSIGNED_BYTE, 0);
	gl.disableVertexAttribArray(SkyBox3D.aPositionShader);    
	gl.disableVertexAttribArray(SkyBox3D.aColorShader);    
	gl.disableVertexAttribArray(SkyBox3D.aNormalShader);    
	gl.disableVertexAttribArray(SkyBox3D.aTextureCoordShader);    
    }
}

