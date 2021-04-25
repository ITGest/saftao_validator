const { ipcRenderer } = window.require("electron")
let $ = window.require("jquery")
const fs = window.require('fs') 
  


$("#file").change(function(){
    var file = document.getElementById('file').files[0];
    var filePath = file.path
    fs.readFile(filePath, (err, data) => {
        var xmlString = data.toString();
        var parser = new DOMParser();
        // validar o numero de entradas e o numero de facturas
        var xmlDoc = parser.parseFromString(xmlString,"text/xml");
        
        var InvoiceCount = $(xmlDoc).find("Invoice").length;
        try{
            var NumberOfEntries = $(xmlDoc).find("NumberOfEntries")[0].innerHTML;
        }
        catch{
            var NumberOfEntries = 0;
        }

        var TotalDebit = parseFloat($(xmlDoc).find("TotalDebit")[0].innerHTML);
        var TotalCredit = parseFloat($(xmlDoc).find("TotalCredit")[0].innerHTML);
        
        var N_invoices = $(xmlDoc).find('Invoice:has(InvoiceStatus:contains("N"))');
        var DebitAmount = N_invoices.find("DebitAmount");
        var CreditAmount = N_invoices.find("CreditAmount");
        
        var arrayDebitAmount = [].slice.call( DebitAmount );
        var arrayCreditAmount = [].slice.call(CreditAmount );

        arrayDebitAmount =  arrayDebitAmount.map(function (el) { return parseFloat(el.innerHTML)});
        arrayCreditAmount =  arrayCreditAmount.map(function (el) { return parseFloat(el.innerHTML)});

        sumDA = arrayDebitAmount.reduce(function (a, b) {return a + b;}, 0)
        sumCA = arrayCreditAmount.reduce(function (a, b) {return a + b;}, 0)
               
        var isDebiyAmountPresent = DebitAmount.length>0
        var isCreditAmountPresent = CreditAmount.length>0

        params = {
            InvoiceCount:InvoiceCount,
            NumberOfEntries: NumberOfEntries,
            xmlString:xmlString,
            //Validar a 2 decimais
            sumDA: Math.floor(sumDA * 100) / 100,
            sumCA: Math.floor(sumCA * 100) / 100,
            TotalDebit: Math.floor(TotalDebit * 100) / 100,
            TotalCredit: Math.floor(TotalCredit * 100) / 100,
            isDebiyAmountPresent:isDebiyAmountPresent,
            isCreditAmountPresent:isCreditAmountPresent
        }
        ipcRenderer.send("file-selected",params)
        $("#file").replaceWith($("#file").val('').clone(true))

    })

});

