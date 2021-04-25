// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const electron = require("electron");
const path = require('path')
const ipcMain = electron.ipcMain;
var validator = require('xsd-schema-validator');
const fs = require("fs");
const ProgressBar = require('electron-progressbar');
const Alert = require("electron-alert");
// const JQ = require("jquery")


function createWindow () {
  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),nodeIntegration: true, webSecurity: false
    }
  })

  mainWindow.loadFile('index.html');

}
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on("test-fun", (event, arg) => {
  createErrorWindow()
})


ipcMain.on("file-selected", (event, arg) => {
  
    var progressBar = new ProgressBar({
      browserWindow: {
          text: 'A preprar informação...',
          detail: 'Agurade...',
          webPreferences: {
              nodeIntegration: true
          }
      }
    });
    let excessDfile = app.getAppPath()+"/saft.xsd";

    validator.validateXML(arg.xmlString, excessDfile, (error, result) => {
        if (result.valid) {
          otherValidations(arg,progressBar)
        } else {
          progressBar.setCompleted();
          createErrorWindow(result.messages);
          console.log(result);
        }
    });

});

function generateAlert(title,type,timer,progressBar){
    let alertOptions = {
      position: "middle",
      title: title,
      type: type,
      showConfirmButton: true,
      timer: timer
    };
    progressBar.setCompleted();
    Alert.fireToast(alertOptions)
}


function createErrorWindow(ErrArray) {
  const win = new BrowserWindow({
    height: 300,
    width: 400,
    autoHideMenuBar: true
  });

  const loadView = ({Errstring}) => {
    return ('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style=" background-color: blue; "><div style="color: yellow;font-weight: bolder;">'+Errstring+'</div></body></html>');
  }
  
  var file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
    Errstring: createErrorLi(ErrArray),
  }));
  win.loadURL(file);
}

function createErrorLi(ErrArray){
  var str = ""
  ErrArray.map(function (err) {
    str = str.concat('<li>' + err + '</li><br>')
  });

  return str
}

function otherValidations(arg,progressBar){
  let NumberOfEntries = parseInt(arg.NumberOfEntries)
  let InvoiceCount= parseInt(arg.InvoiceCount)
  let errorArray = []
  console.log(arg)
  if (InvoiceCount!==NumberOfEntries){
  //   generateAlert("Ficheiro Válido.","success",5000,progressBar)
  // }
  // else{

    // createErrorWindow(["Numero de registos incorrectos."])
    errorArray.push("Numero de registos incorrectos.")
  }
  if (arg.isDebiyAmountPresent && arg.sumDA!==arg.TotalDebit){
    errorArray.push("O Debit Amount não está correcto")
  }

  if (arg.isCreditAmountPresent && arg.sumCA!==arg.TotalCredit){
    errorArray.push("O Credit Amount não está correcto")
  }
  
  if (errorArray.length>0){
    progressBar.setCompleted();
    createErrorWindow(errorArray)
  }
  else{
    generateAlert("Ficheiro Válido.","success",5000,progressBar)
  }

}