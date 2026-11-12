import * as T from './vendor/three.module.js';

// Compact loader for the uncompressed, embedded GLB meshes shipped with Rig Grid.
export async function loadFixtureGLB(url){
 const response=await fetch(url);if(!response.ok)throw Error(`GLB ${response.status}`);
 const bytes=await response.arrayBuffer(),view=new DataView(bytes);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw Error('Unsupported GLB');
 const jsonLength=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,jsonLength)));
 const binHeader=20+jsonLength,binStart=binHeader+8;
 if(view.getUint32(16,true)!==0x4e4f534a||view.getUint32(binHeader+4,true)!==0x004e4942||json.extensionsRequired?.length)throw Error('Unsupported GLB layout');
 const types={5121:Uint8Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
 function accessor(index){const a=json.accessors[index],b=json.bufferViews[a.bufferView],ArrayType=types[a.componentType],stride=b.byteStride||0,components=sizes[a.type];if(!ArrayType||!components||a.sparse)throw Error('Unsupported GLB accessor');const start=binStart+(b.byteOffset||0)+(a.byteOffset||0),count=a.count*components;if(!stride||stride===components*ArrayType.BYTES_PER_ELEMENT)return new ArrayType(bytes.slice(start,start+count*ArrayType.BYTES_PER_ELEMENT));const result=new ArrayType(count);for(let i=0;i<a.count;i++)for(let j=0;j<components;j++){const offset=start+i*stride+j*ArrayType.BYTES_PER_ELEMENT;result[i*components+j]=a.componentType===5126?view.getFloat32(offset,true):a.componentType===5125?view.getUint32(offset,true):a.componentType===5123?view.getUint16(offset,true):view.getUint8(offset)}return result}
 const group=new T.Group();
 for(const node of json.nodes||[]){if(node.mesh===undefined)continue;const holder=new T.Group();holder.name=node.name||'';holder.position.fromArray(node.translation||[0,0,0]);if(node.rotation)holder.quaternion.fromArray(node.rotation);if(node.scale)holder.scale.fromArray(node.scale);group.add(holder);
  for(const p of json.meshes[node.mesh].primitives){if(p.mode!==undefined&&p.mode!==4)continue;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(accessor(p.attributes.POSITION),3));if(p.attributes.NORMAL!==undefined)geo.setAttribute('normal',new T.BufferAttribute(accessor(p.attributes.NORMAL),3));if(p.indices!==undefined)geo.setIndex(new T.BufferAttribute(accessor(p.indices),1));const mat=json.materials?.[p.material]?.pbrMetallicRoughness||{},color=mat.baseColorFactor||[.15,.15,.15,1];const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:new T.Color().setRGB(...color.slice(0,3),T.LinearSRGBColorSpace),metalness:mat.metallicFactor??0,roughness:mat.roughnessFactor??.7,side:json.materials?.[p.material]?.doubleSided?T.DoubleSide:T.FrontSide}));mesh.castShadow=true;mesh.receiveShadow=true;holder.add(mesh)}
 }
 return group;
}
