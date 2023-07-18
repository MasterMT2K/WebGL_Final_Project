class Water3D extends Drawable{

    static positionBuffer = -1;
    static textureCoordBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aColorShader = -1;
    static aTextureCoordShader = -1;
    static aNormalShader = -1;
    
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

    static flashLightDirectionShader = -1;
    static flashLightAmbientShader = -1;
    static flashLightDiffuseShader = -1;
    static flashLightSpecularShader = -1;
    
    static texture = -1;
    static uTextureUnitShader = -1;
    
    divideQuad(a, b, c, d, depth) {
		if (depth>0) {
			var v1 = mult(0.5,add(a,b));
			v1[3] = 1.0;
			var v2 = mult(0.5,add(b,c));
			v2[3] = 1.0;
			var v3 = mult(0.5,add(c,d));
			v3[3] = 1.0;
			var v4 = mult(0.5,add(d,a));
			v4[3] = 1.0;
			var v5 = mult(0.5,add(a,c));
			v5[3] = 1.0;
			this.divideQuad(a, v1, v5,v4, depth - 1);
			this.divideQuad(v1, b, v2,v5, depth - 1);
			this.divideQuad(v2, c, v3,v5, depth - 1);
			this.divideQuad(v3, d, v4,v5, depth - 1);
		}
		else {
			//Triangle #1
			var norm1 = normalize(cross(subtract(b,a), subtract(c,a)));
			this.vertexPositions.push(a);
			this.vertexNormals.push(norm1);
			this.vertexPositions.push(b);
			this.vertexNormals.push(norm1);
			this.vertexPositions.push(c);
			this.vertexNormals.push(norm1);
			//Triangle #2
			var norm2 = normalize(cross(subtract(d,c), subtract(a,c)));
			this.vertexPositions.push(c);
			this.vertexNormals.push(norm2);
			this.vertexPositions.push(d);
			this.vertexNormals.push(norm2);
			this.vertexPositions.push(a);
			this.vertexNormals.push(norm2);
		}
        //Triangle #1
        this.vertexTextureCoords.push(vec2(0.0, 0.0));
        this.vertexTextureCoords.push(vec2(1.0, 0.0));
        this.vertexTextureCoords.push(vec2(1.0, 1.0));
        //Triangle #2
        this.vertexTextureCoords.push(vec2(1.0, 1.0));
        this.vertexTextureCoords.push(vec2(0.0, 1.0));
        this.vertexTextureCoords.push(vec2(0.0, 0.0));
	}

    initialize() {
    	Water3D.shaderProgram = initShaders( gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
		
        // Load the data into the GPU
        Water3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexPositions), gl.STATIC_DRAW );
        
        Water3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexTextureCoords), gl.STATIC_DRAW );
        Water3D.uTextureUnitShader = gl.getUniformLocation(Water3D.shaderProgram, "uTextureUnit");

		Water3D.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW );

        Water3D.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexNormals), gl.STATIC_DRAW );
        
        Water3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Water3D.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Water3D.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Water3D.aPositionShader = gl.getAttribLocation( Water3D.shaderProgram, "aPosition" );
        Water3D.aTextureCoordShader = gl.getAttribLocation( Water3D.shaderProgram, "aTextureCoord" );
        Water3D.aColorShader = gl.getAttribLocation( Water3D.shaderProgram, "aColor" );
		Water3D.aNormalShader = gl.getAttribLocation( Water3D.shaderProgram, "aNormal" );
        
        Water3D.uModelMatrixShader = gl.getUniformLocation( Water3D.shaderProgram, "modelMatrix" );
        Water3D.uCameraMatrixShader = gl.getUniformLocation( Water3D.shaderProgram, "cameraMatrix" );
        Water3D.uProjectionMatrixShader = gl.getUniformLocation( Water3D.shaderProgram, "projectionMatrix" );

        Water3D.uMatAmbientShader = gl.getUniformLocation( Water3D.shaderProgram, "matAmbient" );
		Water3D.uMatDiffuseShader = gl.getUniformLocation( Water3D.shaderProgram, "matDiffuse" );
		Water3D.uMatSpecularShader = gl.getUniformLocation( Water3D.shaderProgram, "matSpecular" );
		Water3D.uMatAlphaShader = gl.getUniformLocation( Water3D.shaderProgram, "matAlpha" );
		
		Water3D.uLightDirectionShader = gl.getUniformLocation( Water3D.shaderProgram, "lightDirection" );
		Water3D.uLightAmbientShader = gl.getUniformLocation( Water3D.shaderProgram, "lightAmbient" );
		Water3D.uLightDiffuseShader = gl.getUniformLocation( Water3D.shaderProgram, "lightDiffuse" );
		Water3D.uLightSpecularShader = gl.getUniformLocation( Water3D.shaderProgram, "lightSpecular" );

        Water3D.flashLightDirectionShader = gl.getUniformLocation( Water3D.shaderProgram, "flashlightDirection" );
        Water3D.flashLightAmbientShader = gl.getUniformLocation( Water3D.shaderProgram, "flashlightAmbient" );
        Water3D.flashLightDiffuseShader = gl.getUniformLocation( Water3D.shaderProgram, "flashlightDiffuse" );
        Water3D.flashLightSpecularShader = gl.getUniformLocation( Water3D.shaderProgram, "flashlightSpecular" );

    }
    
    initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Water3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Water3D.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image.src = "Textures/water2.jpg";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Water3D.shaderProgram == -1){

            var a = vec4(-100,-0.9,4,1);
            var b = vec4(100,-0.9,4,1);
            var c = vec4(100,-0.9,2,1);
            var d = vec4(-100,-0.9,2,1);
            this.vertexPositions = [];
            this.vertexNormals = [];
            this.vertexColors = [];
            this.indices = [];
            this.vertexTextureCoords = [];
            var depth = 5;
			var flow = true;
    
            this.divideQuad(a,b,c,d,depth);

            for(var i = 0; i < this.vertexPositions.length; i++){
                this.vertexColors.push(vec4(0, 0, 1, 1));
            }

            this.initialize()
            this.initializeTexture();
        }
        
    }
    
    draw() {
        if(Water3D.texture == -1)  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(Water3D.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.positionBuffer);
       	gl.vertexAttribPointer(Water3D.aPositionShader, 4, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.textureCoordBuffer);
       	gl.vertexAttribPointer(Water3D.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.colorBuffer);
        gl.vertexAttribPointer(Water3D.aColorShader, 4, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.normalBuffer);
        gl.vertexAttribPointer(Water3D.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, Water3D.texture);
       	gl.uniform1i(Water3D.uTextureUnitShader,0);

       	gl.uniformMatrix4fv(Water3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Water3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(Water3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));
                    
        gl.uniform4fv(Water3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Water3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Water3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Water3D.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Water3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Water3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Water3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Water3D.uLightSpecularShader, light1.specular);

        gl.uniform3fv(Water3D.flashLightDirectionShader, flashlight.direction);
        gl.uniform4fv(Water3D.flashLightAmbientShader, flashlight.ambient);
        gl.uniform4fv(Water3D.flashLightDiffuseShader, flashlight.diffuse);
        gl.uniform4fv(Water3D.flashLightSpecularShader, flashlight.specular);

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Water3D.indexBuffer);
        
        gl.enableVertexAttribArray(Water3D.aPositionShader);    
        gl.enableVertexAttribArray(Water3D.aTextureCoordShader);
        gl.enableVertexAttribArray(Water3D.aColorShader);
		gl.enableVertexAttribArray(Water3D.aNormalShader);
    	// gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositions.length);
    	gl.disableVertexAttribArray(Water3D.aPositionShader);    
    	gl.disableVertexAttribArray(Water3D.aTextureCoordShader);    
        gl.disableVertexAttribArray(Water3D.aColorShader);    
		gl.disableVertexAttribArray(Water3D.aNormalShader);
    }
	
	moveRiver(){
		for(var i = 0; i < this.vertexPositions.length; i++) {
			if (this.flow) {
				this.vertexPositions[i][0] += 0.5;
			} else {
				this.vertexPositions[i][0] -= 0.5;
			}
			gl.bindBuffer( gl.ARRAY_BUFFER, Water3D.positionBuffer);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexPositions), gl.STATIC_DRAW );
		}
	}
}