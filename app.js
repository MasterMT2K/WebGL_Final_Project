var canvas;
var gl;
var angle = 0.0;
var x = 0;
var y = 10;
var z = 10;
var increment = 0.1;
var incrementWalk = 0.05;
var sideX = 0;
var sideY = 1;
var sideZ = 3;
var rollCount = 0;
var pitchCount = 0;
var yawCount = 0;
var incrementRotate = radians(90);

class Light{
    constructor(loc,dir,amb,sp,dif,alpha,cutoff,type){
    	this.location = loc;
    	this.direction = dir;
    	this.ambient = amb;
    	this.specular = sp;
    	this.diffuse = dif;
    	this.alpha = alpha;
    	this.cutoff = cutoff;
    	this.type = type;
    	this.status = 1;
    }
    turnOff(){this.status = 0;}
       
    turnOn(){this.status = 1;}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);
    	
    	this.projectionMatrix = perspective(90.0,1.0,0.1,100);
    	
    	this.updateCameraMatrix();
    }
    
    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }
    
    getModelMatrix(){
    	return this.modelMatrix;
    }
    
    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }    

	roll(amount) {
		var angle = radians(amount);
		var vp = subtract(mult(Math.cos(angle),this.v), mult(Math.sin(angle),this.u));
		var up = add(mult(Math.sin(angle),this.v), mult(Math.cos(angle),this.u));
		this.v = normalize(vp);
		this.u = normalize(up);
		this.updateCameraMatrix();
	}
	pitch(amount){
		var angle = radians(amount);
		var vp = subtract(mult(Math.cos(angle),this.v), mult(Math.sin(angle),this.n));
		var np = add(mult(Math.sin(angle),this.v), mult(Math.cos(angle),this.n));
		this.v = normalize(vp);
		this.n = normalize(np);
		this.updateCameraMatrix();
	}
	yaw(amount){
		var angle = radians(amount);
		var up = subtract(mult(Math.cos(angle),this.u), mult(Math.sin(angle),this.n));
		var np = add(mult(Math.sin(angle),this.u), mult(Math.cos(angle),this.n));
		this.u = normalize(up);
		this.n = normalize(np);
		this.updateCameraMatrix();
	}
}

var camera1 = new Camera(vec3(x,y,z), vec3(1,0,0), vec3(0,Math.sqrt(2)/2,-Math.sqrt(2)/2), vec3(0,Math.sqrt(2)/2,Math.sqrt(2)/2));
//var camera2 = new Camera(vec3(x,5,5), vec3(1,0,0), vec3(0,Math.sqrt(2)/2,-Math.sqrt(2)/2), vec3(0,Math.sqrt(2)/2,Math.sqrt(2)/2));
var light1 = new Light(vec3(x,y,z),vec3(0,0,0),vec4(0.4,0.4,0.4,1.0), vec4(1,1,1,1), vec4(1,1,1,1),0,45,1);
var flashlight = new Light(vec3(x,y,z),normalize(vec3(0, 0, 0)),vec4(0.4, 0.4, 0.4, 1.0),vec4(1, 1, 1, 1),vec4(1, 1, 1, 1),15,(30 * Math.PI) / 180,1);

class Drawable{
    constructor(tx,ty,tz,scale,rotX, rotY, rotZ, amb, dif, sp, sh){
    	this.tx = tx;
    	this.ty = ty;
    	this.tz = tz;
    	this.scale = scale;
    	this.modelRotationX = rotX;
    	this.modelRotationY = rotY;
    	this.modelRotationZ = rotZ;
    	this.updateModelMatrix();
    	
    	this.matAmbient = amb;
    	this.matDiffuse = dif;
    	this.matSpecular = sp;
    	this.matAlpha = sh;
    	
    	
    }
    	
    updateModelMatrix(){
        let t = translate(this.tx, this.ty, this.tz);		     
	   		     
    	let s = scale(this.scale,this.scale,this.scale);
    	
    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);
	
	this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));
    }
    
    getModelMatrix(){
    	return this.modelMatrix;
    }
    
    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }    
}

var leftPlane;
var rightPlane;
var bridgePlane;
var block, block2, block3, block4;
var leaves1, leaves2, leaves3, leaves4, leaves5, leaves6, leaves7, leaves8, leaves9, leaves10, leaves11, leaves12, leaves13, leaves14, leaves15;
var leavesLayer1, leavesLayer2, leavesLayer3, leavesLayer4, leavesLayer5, leavesLayer6, leavesLayer7, leavesLayer8, leavesLayer9, leavesLayer10, leavesLayer11, leavesLayer12, leavesLayer13, leavesLayer14, leavesLayer15;
var stump1, stump2, stump3, stump4, stump5, stump6, stump7, stump8, stump9, stump10, stump11, stump12, stump13, stump14, stump15, stump16, stump17, stump18, stump19, stump20;
var skybox;
var pyramid, smallPyramid, bigPyramid;
var frog;
var sphere;
var bunny;
var teddybear;
var water;
var toggleGroundView = false;
var move = false;
var toggleSpace = false;
var moveBlock = false;
var rotateBlock = true;
var flashlightSwitch = true;
var xLight, yLight;
var currCamera;
var models = [];
var isCamRightOfModel = false;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	gl.cullFace(gl.BACK);

	var pos = vec3(0,0,0);
    var rot = vec3(0,0,0);
    var scale = 1.0;
    var amb = vec4(0.2,0.2,0.2,1.0);
    var dif = vec4(0.6,0.1,0.0,1.0);
    var spec = vec4(1.0,1.0,1.0,1.0);
    var shine = 100.0;
	water = new Water3D(pos[0],pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	
	//leftPlane = new Plane3D(pos[0]-5,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	//rightPlane = new Plane3D(pos[0]+5,pos[1],pos[2],scale/2,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	bridgePlane = new Plane3D(pos[0],pos[1]+14,pos[2],scale*15,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	//block = new Block3D(pos[0]+5,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	block = new Block3D(pos[0]+5,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	block2 = new Block3D(pos[0]+10,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	block3 = new Block3D(pos[0]-5,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	block4 = new Block3D(pos[0]-10,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	frog = new FrogSmf3D(pos[0]+5,pos[1],pos[2],scale/2,rot[0],rot[1]+90,rot[2],amb,dif,spec,shine, "SMFModels/frog.smf");
	bunny = new BunnySmf3D(pos[0]+10,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine, "SMFModels/bunny.smf");
	teddybear = new TeddyBearSmf3D(pos[0]-5,pos[1],pos[2],scale/20,rot[0],rot[1],rot[2],amb,dif,spec,shine, "SMFModels/teddybear.smf");
	sphere = new SphereSmf3D(pos[0]-10,pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine, "SMFModels/smallSphere.smf");

	skybox = new SkyBox3D(pos[0],pos[1],pos[2],scale,rot[0]+180,rot[1],rot[2],amb,dif,spec,shine);
	pyramid = new Pyramid(pos[0],pos[1],pos[2],scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	smallPyramid = new Pyramid(pos[0]-15,pos[1],pos[2]-25,scale*7,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	bigPyramid = new Pyramid(pos[0],pos[1],pos[2]-25,scale*10,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves1 = new Leaves(pos[0]+10,pos[1]+1.5,pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer1 = new Leaves(pos[0]+10,pos[1]+0.5,pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump1 = new Stump3D(pos[0]+10,pos[1],pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves2 = new Leaves(pos[0]+5,pos[1]+1.5,pos[2]-5,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer2 = new Leaves(pos[0]+5,pos[1]+0.5,pos[2]-5,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump2 = new Stump3D(pos[0]+5,pos[1],pos[2]-5,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves3 = new Leaves(pos[0]+7,pos[1]+1.5,pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer3 = new Leaves(pos[0]+2,pos[1]+0.5,pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump3 = new Stump3D(pos[0]+7,pos[1],pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves4 = new Leaves(pos[0]-2,pos[1]+1.5,pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer4 = new Leaves(pos[0]-2,pos[1]+0.5,pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump4 = new Stump3D(pos[0]-2,pos[1],pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves5 = new Leaves(pos[0]-14,pos[1]+1.5,pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer5 = new Leaves(pos[0]-14,pos[1]+0.5,pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump5 = new Stump3D(pos[0]-14,pos[1],pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves6 = new Leaves(pos[0]-2,pos[1]+1.5,pos[2]-4,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer6 = new Leaves(pos[0]-2,pos[1]+0.5,pos[2]-4,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump6 = new Stump3D(pos[0]-2,pos[1],pos[2]-4,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves7 = new Leaves(pos[0]-9,pos[1]+1.5,pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer7 = new Leaves(pos[0]-9,pos[1]+0.5,pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump7 = new Stump3D(pos[0]-9,pos[1],pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves8 = new Leaves(pos[0]+12,pos[1]+1.5,pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer8 = new Leaves(pos[0]+12,pos[1]+0.5,pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump8 = new Stump3D(pos[0]+12,pos[1],pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves9 = new Leaves(pos[0]+22,pos[1]+1.5,pos[2]-12,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer9 = new Leaves(pos[0]+22,pos[1]+0.5,pos[2]-12,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump9 = new Stump3D(pos[0]+22,pos[1],pos[2]-12,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves10 = new Leaves(pos[0]-8,pos[1]+1.5,pos[2]-8,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer10 = new Leaves(pos[0]-8,pos[1]+0.5,pos[2]-8,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump10 = new Stump3D(pos[0]-8,pos[1],pos[2]-8,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves11 = new Leaves(pos[0]-15,pos[1]+1.5,pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer11 = new Leaves(pos[0]-15,pos[1]+0.5,pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump11 = new Stump3D(pos[0]-15,pos[1],pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves12 = new Leaves(pos[0]-1,pos[1]+1.5,pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer12 = new Leaves(pos[0]-1,pos[1]+0.5,pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump12 = new Stump3D(pos[0]-1,pos[1],pos[2]-15,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves13 = new Leaves(pos[0]-3,pos[1]+1.5,pos[2]-3,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer13 = new Leaves(pos[0]-3,pos[1]+0.5,pos[2]-3,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump13 = new Stump3D(pos[0]-3,pos[1],pos[2]-3,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves14 = new Leaves(pos[0]-3,pos[1]+1.5,pos[2]-6,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer14 = new Leaves(pos[0]-3,pos[1]+0.5,pos[2]-6,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump14 = new Stump3D(pos[0]-3,pos[1],pos[2]-6,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	leaves15 = new Leaves(pos[0]+2,pos[1]+1.5,pos[2]-18,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	leavesLayer15 = new Leaves(pos[0]+2,pos[1]+0.5,pos[2]-18,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump15 = new Stump3D(pos[0]+2,pos[1],pos[2]-18,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);

	stump16 = new Stump3D(pos[0]-13,pos[1],pos[2]-4,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump17 = new Stump3D(pos[0]-8,pos[1],pos[2]-7,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump18 = new Stump3D(pos[0]-6,pos[1],pos[2]-12,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump19 = new Stump3D(pos[0]+5,pos[1],pos[2]-9,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	stump20 = new Stump3D(pos[0]+12,pos[1],pos[2]-10,scale,rot[0],rot[1],rot[2],amb,dif,spec,shine);
	// Put camera inside skybox
	currCamera = camera1;
	skybox.ty = currCamera.vrp[1];
	skybox.tz = currCamera.vrp[2];
	skybox.updateModelMatrix();

	models.push(skybox);
	models.push(bridgePlane);
	models.push(water);
	models.push(block);
	models.push(block2);
	models.push(block3);
	models.push(block4);
	models.push(sphere);
	models.push(pyramid);
	models.push(bigPyramid);
    render();
};

function render(){
    setTimeout(function(){
	requestAnimationFrame(render);
    	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Rotates individual models (just need to add them to models list above)
		// for (let i = 0; i < models.length; i++) {
		// 	models[i].modelRotationY += 1;
		// 	models[i].updateModelMatrix();
		// }

		xLight = 7*Math.cos(radians(angle));
		yLight = 7*Math.sin(radians(angle));
		light1.location = vec3(xLight, yLight, 0);
		light1.direction = normalize(vec3(-xLight, -yLight, 0));
		flashlight.direction = normalize(vec3(-xLight, -yLight, 0));
		// flashlight.direction = vec3(-currCamera.vrp[0], -currCamera.vrp[1], -currCamera.vrp[2]);
		angle++;

		gl.disable(gl.DEPTH_TEST); 
		skybox.draw();
		gl.enable(gl.DEPTH_TEST);

		//leftPlane.draw();
		//rightPlane.draw();
		bridgePlane.draw();
		pyramid.draw();
		smallPyramid.draw();
		bigPyramid.draw();

		if(moveBlock){
			block.tx += incrementWalk;
			block.updateModelMatrix();
			block2.tx += incrementWalk;
			block2.updateModelMatrix();
			block3.tx += incrementWalk;
			block3.updateModelMatrix();
			block4.tx += incrementWalk;
			block4.updateModelMatrix();
		} 

		if(rotateBlock){
			block.modelRotationY += incrementRotate;
			block.updateModelMatrix();
			block2.modelRotationY += incrementRotate;
			block2.updateModelMatrix();
			block3.modelRotationY += incrementRotate;
			block3.updateModelMatrix();
			block4.modelRotationY += incrementRotate;
			block4.updateModelMatrix();
		}

		isCamRightOfModel = currCamera.vrp[0] >= bigPyramid.tx;

		if (isCamRightOfModel) {
			block.draw();
			block2.draw();
			block3.draw();
			block4.draw();
		} else {
			sphere.draw();
			bunny.draw();
			teddybear.draw();
			frog.draw();
		}

		leaves1.draw();
		leavesLayer1.draw();
		stump1.draw();

		leaves2.draw();
		leavesLayer2.draw();
		stump2.draw();

		leaves3.draw();
		leavesLayer3.draw();
		stump3.draw();

		leaves4.draw();
		leavesLayer4.draw();
		stump4.draw();

		leaves4.draw();
		leavesLayer4.draw();
		stump4.draw();

		leaves5.draw();
		leavesLayer5.draw();
		stump5.draw();

		leaves5.draw();
		leavesLayer5.draw();
		stump5.draw();

		leaves6.draw();
		leavesLayer6.draw();
		stump6.draw();

		leaves7.draw();
		leavesLayer7.draw();
		stump7.draw();

		leaves8.draw();
		leavesLayer8.draw();
		stump8.draw();

		leaves9.draw();
		leavesLayer9.draw();
		stump9.draw();

		leaves10.draw();
		leavesLayer10.draw();
		stump10.draw();

		leaves11.draw();
		leavesLayer11.draw();
		stump11.draw();

		leaves12.draw();
		leavesLayer12.draw();
		stump12.draw();

		leaves13.draw();
		leavesLayer13.draw();
		stump13.draw();

		leaves14.draw();
		leavesLayer14.draw();
		stump14.draw();

		leaves15.draw();
		leavesLayer15.draw();
		stump15.draw();

		stump16.draw();
		stump17.draw();
		stump18.draw();
		stump19.draw();
		stump20.draw();
		//water.moveRiver();
		water.draw();
    }, 100 );  //10fps
}


document.addEventListener("keydown", function(event) {
	switch(event.key) {
		//Spacebar - Switch Cameras
		case " ":
			if (toggleGroundView){
				if (rollCount > 0) {
					currCamera.roll(rollCount);
				} else {
					currCamera.roll(-rollCount);
				}
				if (pitchCount > 0) {
					currCamera.pitch(pitchCount+45);
				} else {
					currCamera.pitch(-pitchCount+45);
				}
				if (yawCount > 0) {
					currCamera.yaw(yawCount);
				} else {
					currCamera.yaw(-yawCount);
				}
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
				toggleGroundView = false;
			} else {
				if (rollCount > 0) {
					currCamera.roll(-rollCount);
				} else {
					currCamera.roll(rollCount);
				}
				if (pitchCount > 0) {
					currCamera.pitch(-pitchCount-45);
				} else {
					currCamera.pitch(pitchCount-45);
				}
				if (yawCount > 0) {
					currCamera.yaw(-yawCount);
				} else {
					currCamera.yaw(yawCount);
				}
				currCamera.vrp = vec3(sideX, sideY, sideZ);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
				toggleGroundView = true;
			}
			break;
		//left arrow
		case "ArrowLeft":
			if (!toggleGroundView) {
				x -= increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.tx = currCamera.vrp[0];
				skybox.updateModelMatrix();
			}
			break;
		//up arrow
		case "ArrowUp":
			if (!toggleGroundView) {
				//y -= increment;
				z -= increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
			}
			break;
		//right arrow
		case "ArrowRight":
			if (!toggleGroundView) {
				x += increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.tx = currCamera.vrp[0];
				skybox.updateModelMatrix();
			}
			break;
		//down arrow
		case "ArrowDown":
			if (!toggleGroundView) {
				//y += increment;
				z += increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
			}
			break;
		//z - Roll
		case "Z":
			if (!toggleGroundView) {
				currCamera.roll(-0.5);
				rollCount -= 0.5;
			}
			break;
		case "z":
			if (!toggleGroundView) {
				currCamera.roll(0.5);
				rollCount += 0.5;
			}
			break;
		//x - Pitch
		case "X":
			if (!toggleGroundView) {
				currCamera.pitch(-0.5);
				pitchCount -= 0.5;
			}
			break;
		case "x":
			if (!toggleGroundView) {
				currCamera.pitch(0.5);
				pitchCount += 0.5;
			}
			break;
		//c - Yaw
		case "C":
			if (!toggleGroundView) {
				currCamera.yaw(-0.5);
				yawCount -= 0.5;
			}
			break;
		case "c":
			if (!toggleGroundView) {
				currCamera.yaw(0.5);
				yawCount += 0.5;
			}
			break;
		//V - Zoom in 
		case "V":
			if (!toggleGroundView) {
				y -= increment;
				z -= increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
			}
			break;
		//v - Zoom out
		case "v":
			if (!toggleGroundView) {
				y += increment;
				z += increment;
				currCamera.vrp = vec3(x, y, z);
				currCamera.updateCameraMatrix();
				skybox.ty = currCamera.vrp[1];
				skybox.tz = currCamera.vrp[2];
				skybox.updateModelMatrix();
			}
			break;
		case "r":
			if (water.flow) {
				water.flow = false;
			}
			else {
				water.flow = true;
			}
			break;
		case "w":
			if(moveBlock) {
				moveBlock = false;
			} else {
				moveBlock = true;
			}
		case "b":
			if(rotateBlock) {
				rotateBlock = false;
			} else {
				rotateBlock = true;
			}
		case "f":
			if(flashlightSwitch) {
				flashlight.turnOn();
				flashlightSwitch = false;
			} else {
				flashlight.turnOff();
				flashlightSwitch = true;
			}
		case "d":
			bridgePlane.useDark();
			// block.useDark();
			// block2.useDark();
			// block3.useDark();
			// block4.useDark();
	}
});