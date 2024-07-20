const puppeteer = require('puppeteer');
const axios = require('axios');
const readline = require('readline');

let cookies;
let genericHeaders;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function setupSession() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    
    try {
        await page.goto('*Insert Website URL*', { waitUntil: 'networkidle0' });
        
        console.log('If there is a CAPTCHA, please solve it manually in the browser window.');
        console.log('After solving the CAPTCHA, press Enter in this console to continue...');
        
        await new Promise(resolve => process.stdin.once('data', resolve));
        
        // Get cookies and store them globally
        cookies = await page.cookies();
        console.log('Cookies stored in memory');

        // Set up generic headers
        setupGenericHeaders();

        // Start console interface
        startConsoleInterface();

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

function setupGenericHeaders() {
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    const csrfToken = cookies.find(cookie => cookie.name === 'CSRFToken')?.value;

    genericHeaders = {
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cookie': cookieString,
        'Csrftoken': csrfToken,
        'Priority': 'u=1, i',
        'Referer': '**INSERT API ENDPOINT URL**',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    };
}

function startConsoleInterface() {
    console.log('\nConsole Interface:');
    console.log('1. *DNU*Get Product Size');
    console.log('2. *DNU*Restock Email');
    console.log('3. *DNU*Restock Email All');
    console.log('4. Get Stock from URL');
    console.log('5. Exit');
    askForChoice();
}

function askForChoice() {
    rl.question('Enter your choice (1, 2, 3, 4, or 5): ', async (choice) => {
        switch (choice) {
            case '1':
                await promptGetProductSize();
                break;
            case '2':
                await promptRestockEmail();
                break;
            case '3':
                await promptRestockEmailAll();
                break;
            case '4':
                await promptGetStockFromHTML();
                break;
            case '5':
                console.log('Exiting...');
                rl.close();
                process.exit(0);
            default:
                console.log('Invalid choice. Please enter 1, 2, 3, 4, or 5.');
                askForChoice();
        }
    });
}

async function promptGetProductSize() {
    rl.question('Enter product code: ', async (productCode) => {
        await getProductSize(productCode);
        askForChoice();
    });
}

async function promptRestockEmail() {
    rl.question('Enter product code: ', (productCode) => {
        rl.question('Enter size: ', (size) => {
            rl.question('Enter email: ', async (email) => {
                await restockEmail(productCode, size, email);
                askForChoice();
            });
        });
    });
}

async function promptRestockEmailAll() {
    rl.question('Enter product code: ', async (productCode) => {
        rl.question('Enter email: ', async (email) => {
            await restockEmailAll(productCode, email);
            askForChoice();
        });
    });
}

async function getProductSize(productCode) {
    const headers = {
        ...genericHeaders,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    };

    try {
        const response = await axios.get(`**API ENDPOINT URL LINK ${productCode}**`, {
            headers: headers
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API call error:', error.message);
        return null;
    }
}

async function restockEmail(productCode, size, email) {
    const headers = {
        ...genericHeaders,
        'Content-Type': 'application/json',
    };

    const payload = {
        "email": email,
        "productCode": productCode,
        "size": size,
        "location": "**API ENDPOINT URL**"
    };

    try {
        const response = await axios.post('**API ENDPOINT URL**', payload, {
            headers: headers
        });
        console.log('POST Request Successful');
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        return true; // Request was successful
    } catch (error) {
        console.error('POST Request Failed');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
        return false; // Request failed
    }
}

async function restockEmailAll(productCode, email) {
    try {
        // Define a list of common shoe sizes
        const commonSizes = ['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'];

        let successCount = 0;
        let failureCount = 0;

        for (const size of commonSizes) {
            const result = await restockEmail(productCode, size, email);
            if (result) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        console.log(`Email signed up successfully ${successCount} times.`);
        if (failureCount > 0) {
            console.log(`Failed to sign up ${failureCount} times.`);
        }
    } catch (error) {
        console.error('Error in restockEmailAll:', error.message);
    }
}

async function promptGetStockFromHTML() {
    rl.question('Enter the product URL: ', async (url) => {
        console.log('Opening browser window. Please solve any CAPTCHA if presented.');
        console.log('Press Enter in this console after solving CAPTCHA or when the page is fully loaded...');
        
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
            
            // Navigate to the page
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
            
            // Wait for user to solve CAPTCHA and press Enter
            await new Promise(resolve => process.stdin.once('data', resolve));
            
            console.log('Proceeding with stock retrieval...');
            
            const inStockSizes = await getStockFromPage(page);
            console.log('In-stock sizes:', inStockSizes);
        } catch (error) {
            console.error('Error getting stock information:', error.message);
        } finally {
            if (browser) {
                await browser.close();
            }
            askForChoice();
        }
    });
}

async function getStockFromPage(page) {
    try {
        // Scroll the page to trigger lazy-loading elements
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Wait a bit for any lazy-loaded content
        await page.waitForTimeout(2000);

        // Use a more general selector
        const inStockSizes = await page.evaluate(() => {
            const sizeOptions = document.querySelectorAll('[data-name][data-value]');
            return Array.from(sizeOptions)
                .filter(option => !option.classList.contains('product__sizes-option--disabled'))
                .map(option => ({
                    size: option.getAttribute('data-name'),
                    value: option.getAttribute('data-value'),
                    stock: option.getAttribute('data-stock') || 'In Stock',
                    isJunior: option.getAttribute('data-junior') === 'true'
                }));
        });

        if (inStockSizes.length === 0) {
            console.log('No sizes found. The page structure might have changed or the product might be out of stock.');
        }

        return inStockSizes;
    } catch (error) {
        console.error('Error in getStockFromPage:', error.message);
        console.log('Attempting to capture page content...');
        try {
            await page.screenshot({ path: 'error_screenshot.png' });
            console.log('Screenshot saved as error_screenshot.png');
            const html = await page.content();
            console.log('Page HTML:', html);
        } catch (screenshotError) {
            console.error('Failed to capture error state:', screenshotError.message);
        }
        throw error;
    }
}

async function promptGetStockFromHTML() {
    rl.question('Enter the product URL: ', async (url) => {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
            
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
            
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

            const inStockSizes = await getStockFromPage(page);
            console.log(JSON.stringify(inStockSizes, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            if (browser) {
                await browser.close();
            }
            askForChoice();
        }
    });
}

async function getStockFromPage(page) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const sizes = await page.evaluate(() => {
        const sizeOptions = document.querySelectorAll('[data-name][data-value]');
        return Array.from(sizeOptions).map(option => ({
            size: option.getAttribute('data-name'),
            inStock: !option.classList.contains('product__sizes-option--disabled'),
            stock: option.getAttribute('data-stock') || (option.classList.contains('product__sizes-option--disabled') ? 'Out of Stock' : 'In Stock')
        }));
    });

    if (sizes.length === 0) {
        throw new Error('No sizes found. The page structure might have changed or the product might be out of stock.');
    }

    return sizes;
}

setupSession();