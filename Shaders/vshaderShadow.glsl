#version 300 es
in vec3 aPosition;
out vec4 shadowCoord;
out float camDepth;
uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projMatrix;
uniform mat4 lightCameraMatrix;

out vec4 pos;

void main()
{
    gl_Position = projMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    shadowCoord = projMatrix*lightCameraMatrix*modelMatrix*vec4(aPosition,1.0);
    camDepth = -(lightCameraMatrix*modelMatrix*vec4(aPosition,1.0)).z;
}