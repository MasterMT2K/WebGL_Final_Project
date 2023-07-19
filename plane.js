class Plane3D extends Drawable{

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
    	Plane3D.shaderProgram = initShaders( gl, "/Shaders/vshader.glsl", "/Shaders/fshader.glsl");
		
        // Load the data into the GPU
        Plane3D.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexPositions), gl.STATIC_DRAW );
        
        Plane3D.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexTextureCoords), gl.STATIC_DRAW );
        Plane3D.uTextureUnitShader = gl.getUniformLocation(Plane3D.shaderProgram, "uTextureUnit");

		Plane3D.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW );

        Plane3D.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertexNormals), gl.STATIC_DRAW );
        
        Plane3D.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane3D.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Plane3D.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Plane3D.aPositionShader = gl.getAttribLocation( Plane3D.shaderProgram, "aPosition" );
        Plane3D.aTextureCoordShader = gl.getAttribLocation( Plane3D.shaderProgram, "aTextureCoord" );
        Plane3D.aColorShader = gl.getAttribLocation( Plane3D.shaderProgram, "aColor" );
		Plane3D.aNormalShader = gl.getAttribLocation( Plane3D.shaderProgram, "aNormal" );
        
        Plane3D.uModelMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "modelMatrix" );
        Plane3D.uCameraMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "cameraMatrix" );
        Plane3D.uProjectionMatrixShader = gl.getUniformLocation( Plane3D.shaderProgram, "projectionMatrix" );

        Plane3D.uMatAmbientShader = gl.getUniformLocation( Plane3D.shaderProgram, "matAmbient" );
		Plane3D.uMatDiffuseShader = gl.getUniformLocation( Plane3D.shaderProgram, "matDiffuse" );
		Plane3D.uMatSpecularShader = gl.getUniformLocation( Plane3D.shaderProgram, "matSpecular" );
		Plane3D.uMatAlphaShader = gl.getUniformLocation( Plane3D.shaderProgram, "matAlpha" );
		
		Plane3D.uLightDirectionShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightDirection" );
		Plane3D.uLightAmbientShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightAmbient" );
		Plane3D.uLightDiffuseShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightDiffuse" );
		Plane3D.uLightSpecularShader = gl.getUniformLocation( Plane3D.shaderProgram, "lightSpecular" );

        Plane3D.flashLightDirectionShader = gl.getUniformLocation( Plane3D.shaderProgram, "flashlightDirection" );
        Plane3D.flashLightAmbientShader = gl.getUniformLocation( Plane3D.shaderProgram, "flashlightAmbient" );
        Plane3D.flashLightDiffuseShader = gl.getUniformLocation( Plane3D.shaderProgram, "flashlightDiffuse" );
        Plane3D.flashLightSpecularShader = gl.getUniformLocation( Plane3D.shaderProgram, "flashlightSpecular" );

    }
    
    initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Plane3D.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Plane3D.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image.src = "Textures/aram_pathway.png";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        var dark = true;
        if(Plane3D.shaderProgram == -1){

            var a = vec4(-5,-1,5,1);
            var b = vec4(5,-1,5,1);
            var c = vec4(5,-1,-5,1);
            var d = vec4(-5,-1,-5,1);
            this.vertexPositions = [];
            this.vertexNormals = [];
            this.vertexColors = [];
            this.indices = [];
            this.vertexTextureCoords = [];
            var depth = 5;
    
            this.divideQuad(a,b,c,d,depth);

            for(var i = 0; i < this.vertexPositions.length; i++){
                this.vertexColors.push(vec4(0, 1, 0, 1));
            }
            // this.useDark();
            this.initialize()
            this.initializeTexture();
        }
        
    }
    
    draw() {
        if(Plane3D.texture == -1)  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(Plane3D.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.positionBuffer);
       	gl.vertexAttribPointer(Plane3D.aPositionShader, 4, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.textureCoordBuffer);
       	gl.vertexAttribPointer(Plane3D.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.colorBuffer);
        gl.vertexAttribPointer(Plane3D.aColorShader, 4, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, Plane3D.normalBuffer);
        gl.vertexAttribPointer(Plane3D.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, Plane3D.texture);
       	gl.uniform1i(Plane3D.uTextureUnitShader,0);

       	gl.uniformMatrix4fv(Plane3D.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Plane3D.uCameraMatrixShader, false, flatten(currCamera.cameraMatrix));
        gl.uniformMatrix4fv(Plane3D.uProjectionMatrixShader, false, flatten(currCamera.projectionMatrix));
                    
        gl.uniform4fv(Plane3D.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Plane3D.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Plane3D.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Plane3D.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Plane3D.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Plane3D.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Plane3D.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Plane3D.uLightSpecularShader, light1.specular);

        gl.uniform3fv(Plane3D.flashLightDirectionShader, flashlight.direction);
        gl.uniform4fv(Plane3D.flashLightAmbientShader, flashlight.ambient);
        gl.uniform4fv(Plane3D.flashLightDiffuseShader, flashlight.diffuse);
        gl.uniform4fv(Plane3D.flashLightSpecularShader, flashlight.specular);

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane3D.indexBuffer);
        
        gl.enableVertexAttribArray(Plane3D.aPositionShader);    
        gl.enableVertexAttribArray(Plane3D.aTextureCoordShader);
        gl.enableVertexAttribArray(Plane3D.aColorShader);
		gl.enableVertexAttribArray(Plane3D.aNormalShader);
    	// gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositions.length);
    	gl.disableVertexAttribArray(Plane3D.aPositionShader);    
    	gl.disableVertexAttribArray(Plane3D.aTextureCoordShader);    
        gl.disableVertexAttribArray(Plane3D.aColorShader);    
		gl.disableVertexAttribArray(Plane3D.aNormalShader);
    }

    useDark() {
        if (this.dark) {
            this.initialize("/vshader.glsl", "/fshaderDark.glsl")
            this.dark = false;
        } else {
            this.initialize("/vshader.glsl", "/fshader.glsl")
            this.dark = true;
        }
    }
}