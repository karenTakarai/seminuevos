require("dotenv").config();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function getInputIdByLabel(page, labelText) {
    const inputId = await page.evaluate((labelText) => {
      const labels = Array.from(document.querySelectorAll('label'));
      const targetLabel = labels.find(label => label.textContent.includes(labelText));

        if (!targetLabel) return null;

        const forId = targetLabel.getAttribute('for');
        return forId || null;
    }, labelText);
  
    if (!inputId) {
      console.warn(`No se encontró un input con ID asociado a la etiqueta: "${labelText}"`);
    }
  
    return inputId;
}

async function clickSelectOptionByText(page, selectAriaLabelId, optionText) {
    const optionHandle = await page.evaluateHandle((ariaId, text) => {
      const container = document.querySelector(`.mantine-Select-options[aria-labelledby="${ariaId}-label"]`);
      if (!container) return null;
  
      const options = Array.from(container.querySelectorAll('div'));
      return options.find(option => option.textContent.trim().toLowerCase() === text.toLowerCase()) || null;
    }, selectAriaLabelId, optionText);
  
    if (optionHandle) {
      await optionHandle.click();
      await optionHandle.dispose();
    } else {
      throw new Error(`No se encontró la opción "${optionText}"`);
    }
  }
  
async function clickButtonByText(page, btntext){
    const buttonHandle = await page.evaluateHandle((btntext) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const lowerText = btntext.toLowerCase();
    
        let button = buttons.find(btn =>
          btn.querySelector('span')?.textContent.trim().toLowerCase() === lowerText
        );
    
        if (!button) {
          button = buttons.find(btn =>
            btn.textContent.trim().toLowerCase() === lowerText
          );
        }
    
        return button || null;
      }, btntext);
    
      if (buttonHandle) {
        await buttonHandle.click();
        await buttonHandle.dispose();
      } else {
        console.log(`No se encontró el botón con el texto: "${btntext}"`);
      }
}

async function fillForm(page, inputs) {

    const brandInputId = await getInputIdByLabel(page, 'Marca');
    await page.click("#"+brandInputId);
    await clickSelectOptionByText(page, brandInputId, inputs.brand);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const modelInputId = await getInputIdByLabel(page, 'Modelo');
    await page.click("#"+modelInputId);
    await clickSelectOptionByText(page, modelInputId,inputs.model);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const subtypeInputId = await getInputIdByLabel(page,'Subtipo');
    await page.click("#"+subtypeInputId);
    await clickSelectOptionByText(page, subtypeInputId, inputs.subtype);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const yearInputId = await getInputIdByLabel(page,'Año');
    await page.click("#"+yearInputId);
    await clickSelectOptionByText(page, yearInputId, inputs.year);

    const zipCodeInputId = await getInputIdByLabel(page,'Código Postal');
    await page.type("#"+zipCodeInputId,'64000', {delay: 50});
    await new Promise(resolve => setTimeout(resolve, 1000));
    await clickSelectOptionByText(page, zipCodeInputId, inputs.zipCode);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const cityInputId = await getInputIdByLabel(page,'Ciudad del vehículo');
    await page.click("#"+cityInputId);
    await clickSelectOptionByText(page, cityInputId,inputs.city);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const versionInputId = await getInputIdByLabel(page,'Versión');
    await page.click("#"+versionInputId);
    await clickSelectOptionByText(page, versionInputId, inputs.version);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const colorInputId = await getInputIdByLabel(page,'Color');
    await page.click("#"+colorInputId);
    await clickSelectOptionByText(page, colorInputId, inputs.color);    

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const kmsInputId = await getInputIdByLabel(page,'Recorrido');
    await page.type("#"+kmsInputId, inputs.kms, {delay: 50});

    await new Promise(resolve => setTimeout(resolve, 1000));

    const priceInputId = await getInputIdByLabel(page,'Precio');
    await page.type("#"+priceInputId, inputs.price, {delay: 50});

    await new Promise(resolve => setTimeout(resolve, 1000));

    const negotiableInputId = await getInputIdByLabel(page,'Negociable');
    await page.click("#"+negotiableInputId);
    
}

async function publish(price, description) {
    const browser = await puppeteer.launch({ headless: false,
        defaultViewport: null,
        args: ['--start-maximized'] 
    });

    const inputs = {
        brand: 'Acura',
        model: 'ILX',
        subtype : 'Sedán',
        year: '2018',
        zipCode: '64000 - Monterrey',
        city: 'Monterrey',
        kms: "20000",
        price : price,
        version: "2.4 Tech At",
        color: "Negro",
        description: description,
        phoneNumber: "8131104778",
    }
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://www.seminuevos.com/');

    await page.waitForSelector('.login-btn');
    await page.click('.login-btn');

    await page.waitForSelector('#email');

    await page.type('#email', process.env.EMAIL, { delay: 50});
    await page.type('#password', process.env.PASSWORD, {delay: 50});
    await page.click('button[type="submit"]');

    await page.waitForNavigation();

    await page.waitForSelector('ul#primaryNav li:nth-child(2) a');
    await page.click('ul#primaryNav li:nth-child(2) a');
  
    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.waitForSelector('button.mantine-focus-auto');
    await page.click('button.mantine-focus-auto');

    await new Promise(resolve => setTimeout(resolve, 1000));

    await fillForm(page, inputs);

    await clickButtonByText(page,'Siguiente');

    await new Promise(resolve => setTimeout(resolve, 1000));

    await clickButtonByText(page,'Continuar');

    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.waitForSelector('.mantine-RichTextEditor-content');
    await page.click('.mantine-RichTextEditor-content');
    await page.type('.mantine-RichTextEditor-content', inputs.description, { delay: 50});

    await new Promise(resolve => setTimeout(resolve, 1000));
      
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile(
            path.resolve(__dirname, 'fotos', 'test1.jpeg'),
            path.resolve(__dirname, 'fotos', 'test2.png'),
            path.resolve(__dirname, 'fotos', 'test3.jpg')
          );
      console.log('Archivo subido vía input oculto');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await clickButtonByText(page,'Siguiente');

    await page.waitForSelector('.mantine-Input-input');

    await page.type(".mantine-Input-input", inputs.phoneNumber, {delay: 50});

    await new Promise(resolve => setTimeout(resolve, 1000));

    await clickButtonByText(page,'Siguiente');

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'publicar-auto.png' });

    await browser.close();
}

module.exports = publish;
