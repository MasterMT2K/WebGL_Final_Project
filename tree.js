class Stump3D extends Drawable{
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

    static computeNormals(){
	var normalSum = [];
	var counts = [];
	
	//initialize sum of normals for each vertex and how often its used.
	for (var i = 0; i<Stump3D.vertexPositions.length; i++) {
	    normalSum.push(vec3(0, 0, 0));
	    counts.push(0);
	}
	
	//for each triangle
	for (var i = 0; i<Stump3D.indices.length; i+=3) {
	    var a = Stump3D.indices[i];
	    var b = Stump3D.indices[i+1];
	    var c = Stump3D.indices[i+2];
	    
	    var edge1 = subtract(Stump3D.vertexPositions[b],Stump3D.vertexPositions[a])
	    var edge2 = subtract(Stump3D.vertexPositions[c],Stump3D.vertexPositions[b])
	    var N = cross(edge1,edge2)
	    
	    normalSum[a] = add(normalSum[a],normalize(N));
	    counts[a]++;
	    normalSum[b] = add(normalSum[b],normalize(N));
	    counts[b]++;
	    normalSum[c] = add(normalSum[c],normalize(N));
	    counts[c]++;
	
	}

	for (var i = 0; i < Stump3D.vertexPositions.length; i++)
	    this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
		//console.log("cube ", this.vertexNormals);
    }

    static initialize() {
        Stump3D.computeNormals();
    	Stump3D.shaderProgram = initShaders( gl, "/Shaders/vshaderCube.glsl", "/Shaders/fshaderCube.glsl");
		
		// Load the data into the GPU
		Stump3D.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Stump3D.vertexPositions), gl.STATIC_DRAW );
		
		Stump3D.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Stump3D.vertexColors), gl.STATIC_DRAW );
		
		Stump3D.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Stump3D.vertexNormals), gl.STATIC_DRAW );
		
		Stump3D.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Stump3D.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Stump3D.indices), gl.STATIC_DRAW );
			
		Stump3D.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.textureCoordBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Stump3D.vertexTextureCoords), gl.STATIC_DRAW );
		Stump3D.uTextureUnitShader = gl.getUniformLocation(Stump3D.shaderProgram, "uTextureUnit");

		// Associate our shader variables with our data buffer
		Stump3D.aPositionShader = gl.getAttribLocation( Stump3D.shaderProgram, "aPosition" );
		Stump3D.aColorShader = gl.getAttribLocation( Stump3D.shaderProgram, "aColor" );
		Stump3D.aNormalShader = gl.getAttribLocation( Stump3D.shaderProgram, "aNormal" );
		Stump3D.aTextureCoordShader = gl.getAttribLocation( Stump3D.shaderProgram, "aTextureCoord" );

		Stump3D.uModelMatrixShader = gl.getUniformLocation( Stump3D.shaderProgram, "modelMatrix" );
		Stump3D.uCameraMatrixShader = gl.getUniformLocation( Stump3D.shaderProgram, "cameraMatrix" );
		Stump3D.uProjectionMatrixShader = gl.getUniformLocation( Stump3D.shaderProgram, "projectionMatrix" );
		
		Stump3D.uMatAmbientShader = gl.getUniformLocation( Stump3D.shaderProgram, "matAmbient" );
		Stump3D.uMatDiffuseShader = gl.getUniformLocation( Stump3D.shaderProgram, "matDiffuse" );
		Stump3D.uMatSpecularShader = gl.getUniformLocation( Stump3D.shaderProgram, "matSpecular" );
		Stump3D.uMatAlphaShader = gl.getUniformLocation( Stump3D.shaderProgram, "matAlpha" );
		
		Stump3D.uLightDirectionShader = gl.getUniformLocation( Stump3D.shaderProgram, "lightDirection" );
		Stump3D.uLightAmbientShader = gl.getUniformLocation( Stump3D.shaderProgram, "lightAmbient" );
		Stump3D.uLightDiffuseShader = gl.getUniformLocation( Stump3D.shaderProgram, "lightDiffuse" );
		Stump3D.uLightSpecularShader = gl.getUniformLocation( Stump3D.shaderProgram, "lightSpecular" );

		Stump3D.FlashLightDirectionShader = gl.getUniformLocation( Stump3D.shaderProgram, "flashlightDirection" );
		Stump3D.FlashLightAmbientShader = gl.getUniformLocation( Stump3D.shaderProgram, "flashlightAmbient" );
		Stump3D.FlashLightDiffuseShader = gl.getUniformLocation( Stump3D.shaderProgram, "flashlightDiffuse" );
		Stump3D.FlashLightSpecularShader = gl.getUniformLocation( Stump3D.shaderProgram, "flashlightSpecular" );
		
    }
    	
    static initializeTexture(){
        var image = new Image();

		image.onload = function(){
            Stump3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Stump3D.texture);            
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
        
        image.src = "Textures/bark.jpg";
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
		var walk = true;
		var dark = true;
        if(Stump3D.shaderProgram == -1) {
			Stump3D.initialize();
			Stump3D.initializeTexture();
		}
        
    }
    
    draw() {
	if(Stump3D.texture == -1)  //only draw when texture is loaded.
		return;
		
    gl.useProgram(Stump3D.shaderProgram);
        
    gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.positionBuffer);
    gl.vertexAttribPointer(Stump3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
    gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.colorBuffer);
   	gl.vertexAttribPointer(Stump3D.aColorShader, 4, gl.FLOAT, false, 0, 0 );
       	
   	gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.normalBuffer);
  	gl.vertexAttribPointer(Stump3D.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
    
	gl.bindBuffer( gl.ARRAY_BUFFER, Stump3D.textureCoordBuffer);
	gl.vertexAttribPointer(Stump3D.aTextureCoordShader, 3, gl.FLOAT, false, 0, 0 ); 

	gl.activeTexture(gl.TEXTURE0);
	 gl.bindTexture(gl.TEXTURE_CUBE_MAP, Stump3D.texture);
	//gl.bindTexture(gl.TEXTURE_2D, Stump3D.texture);
	gl.uniform1i(Stump3D.uTextureUnitShader,0);

	gl.uniformMatrix4fv(Stump3D.uModelMatrixShader, false, flatten(this.modelMatrix));
	gl.uniformMatrix4fv(Stump3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
	gl.uniformMatrix4fv(Stump3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));
	
	gl.uniform4fv(Stump3D.uMatAmbientShader, this.matAmbient);
	gl.uniform4fv(Stump3D.uMatDiffuseShader, this.matDiffuse);
	gl.uniform4fv(Stump3D.uMatSpecularShader, this.matSpecular);
	gl.uniform1f(Stump3D.uMatAlphaShader, this.matAlpha);
	
	gl.uniform3fv(Stump3D.uLightDirectionShader, light1.direction);
	gl.uniform4fv(Stump3D.uLightAmbientShader, light1.ambient);
	gl.uniform4fv(Stump3D.uLightDiffuseShader, light1.diffuse);
	gl.uniform4fv(Stump3D.uLightSpecularShader, light1.specular);

	gl.uniform3fv(Stump3D.FlashLightDirectionShader, flashlight.direction);
	gl.uniform4fv(Stump3D.FlashLightAmbientShader, flashlight.ambient);
	gl.uniform4fv(Stump3D.FlashLightDiffuseShader, flashlight.diffuse);
	gl.uniform4fv(Stump3D.FlashLightSpecularShader, flashlight.specular);
		
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Stump3D.indexBuffer);
	
	gl.enableVertexAttribArray(Stump3D.aPositionShader);    
	gl.enableVertexAttribArray(Stump3D.aColorShader);
	gl.enableVertexAttribArray(Stump3D.aNormalShader);  
	gl.enableVertexAttribArray(Stump3D.aTextureCoordShader);    
	gl.drawElements(gl.TRIANGLES, Stump3D.indices.length, gl.UNSIGNED_BYTE, 0);
	gl.disableVertexAttribArray(Stump3D.aPositionShader);    
	gl.disableVertexAttribArray(Stump3D.aColorShader);    
	gl.disableVertexAttribArray(Stump3D.aNormalShader);    
	gl.disableVertexAttribArray(Stump3D.aTextureCoordShader);    
    }

	useDark() {
        if (this.dark) {
            Stump3D.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshaderDark.glsl");
            gl.useProgram(Stump3D.shaderProgram);
            this.dark = false;
        } else {
            Stump3D.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");
            gl.useProgram(Stump3D.shaderProgram);
            this.dark = true;
        }
    }
}