#version 300 es
in vec3 aPosition;
in vec4 aColor;
in vec3 aNormal;
in vec2 aTextureCoord;

out vec2 vTextureCoord;
out vec4 vColor;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec3 lightDirection;
uniform vec4 lightAmbient, lightDiffuse, lightSpecular;

uniform vec3 flashlightDirection;
uniform vec4 flashlightAmbient, flashlightDiffuse, flashlightSpecular;

void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);

    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a directional light, this is just -lightDirection
    vec3 L = normalize((-cameraMatrix*vec4(lightDirection,0.0)).xyz);
    vec3 fL = normalize((-cameraMatrix*vec4(flashlightDirection,0.0)).xyz);

    //the ray from the vertex towards the camera
    vec3 E = normalize(vec3(0,0,0)-pos);

    //normal in camera coordinates
    vec3 N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;

    //half-way vector	
    vec3 H = normalize(L+E);

    vec4 ambient = lightAmbient*matAmbient;
    vec4 fambient = flashlightAmbient*matAmbient;

    float Kd = max(dot(L,N),0.0);
    vec4 diffuse = Kd*lightDiffuse*matDiffuse;
    float fKd = max(dot(fL,N),0.0);
    vec4 fdiffuse = fKd*flashlightDiffuse*matDiffuse;

    float Ks = pow(max(dot(N,H),0.0),matAlpha);
    vec4 specular = Ks*lightSpecular*matSpecular;
    float fKs = pow(max(dot(N,H),0.0),matAlpha);
    vec4 fspecular = fKs*flashlightSpecular*matSpecular;

    if(dot(L,N)< 0.0 || dot(fL, N)< 0.0)
        specular = vec4(0,0,0,1);
    vec4 lightColor = ambient + diffuse + specular + fambient + fdiffuse + fspecular;
    lightColor.a = 1.0;

    vColor = 0.1*aColor+0.9*lightColor;
    vTextureCoord = aTextureCoord;
}