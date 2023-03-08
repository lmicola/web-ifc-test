import { IfcAPI, ms } from 'web-ifc';
import { IfcThree } from './web-ifc-three';
import { Init3DView, InitBasicScene, scene } from './web-ifc-scene';

let ifcAPI = new IfcAPI();
ifcAPI.SetWasmPath( './../node_modules/web-ifc/', true )
let ifcThree = new IfcThree(ifcAPI);
let timeout = undefined;
await ifcAPI.Init();

const fileInput = document.getElementById('finput');
fileInput.addEventListener('change', fileInputChanged);


Init3DView();
InitBasicScene();

async function fileInputChanged() {
    let fileInput = document.getElementById('finput');
    if (fileInput.files.length == 0) return console.log('No files selected!');
    const file = fileInput.files[0];
    const reader = getFileReader(fileInput);
    reader.readAsArrayBuffer(file);
  }

  function getFileReader(fileInput){
    var reader = new FileReader();
    reader.onload = () => {
      const data = getData(reader);
      LoadModel(data);
      fileInput.value = '';
    };
    return reader;
  }

  function getData(reader){
    const startRead = ms();
    //@ts-ignore
    const data = new Uint8Array(reader.result);
    const readTime = ms() - startRead;
    console.log(`Reading took ${readTime} ms`);
    return data;
  }

  async function LoadModel(data) {
    const start = ms();
    //TODO: This needs to be fixed in the future to rely on elalish/manifold


    /*
        CIRCLE_SEGMENTS_LOW: 5,
        CIRCLE_SEGMENTS_MEDIUM: 8,
        CIRCLE_SEGMENTS_HIGH: 15,
    */
    const modelID = ifcAPI.OpenModel(data, { 
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLS: false,
        CIRCLE_SEGMENTS_LOW:6,
        CIRCLE_SEGMENTS_MEDIUM: 10,
        CIRCLE_SEGMENTS_HIGH: 20,
        }); 
    const time = ms() - start;
    console.log(`Opening model took ${time} ms`);
    ifcThree.LoadAllGeometry(scene, modelID);
    

    // log errors to console
    let errors = ifcAPI.GetAndClearErrors(modelID);
    for (let i = 0; i < errors.size(); i++)
    {
        //console.log(errors.get(i));
    }

    ifcAPI.CloseModel(modelID);
}
  
  