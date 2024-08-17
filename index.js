const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let sessions = {};

app.post('/webhook', async (req, res) => {
    const { body } = req;

    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const text = message.text ? message.text.body.toLowerCase() : '';

        if (!sessions[from]) {
            sessions[from] = { step: 0 };
        }

        const session = sessions[from];

        switch (session.step) {
            case 0:
                await sendTemplateMessage(from, 'first_message');
                session.step = 1;
                break;
            case 1:
                if (text.includes('english')) {
                    await sendTemplateMessage(from, 'service_message');
                    session.step = 2;}
                    break
            case 2:
                if (text.includes('service information')) {
                    await sendTemplateMessage(from, 'service_information');
                    session.step = 3;
                } else if (text.includes('place an order')) {
                    await sendTemplateMessage(from, 'order_template');
                    session.step = 4;
                } else if (text.includes('report an issue')) {
                    await sendTemplateMessage(from, 'report_template');
                    session.step = 5;
                } else {
                    await sendTextMessage(from, "Please select a valid option: 'Service Information', 'Place an Order', or 'Report an Issue'.");
                }
                break;

            case 3:
                if (text.includes('skincare')) {
                    await sendTemplateMessage(from, 'skincare');
                    session.step = 6; // Check for SKINCARE products
                } else if (text.includes('hair care')) {
                    await sendTemplateMessage(from, 'haircare');
                    session.step = 7; // Check for HAIR CARE products
                } else {
                    await sendTextMessage(from, "Please select 'SKINCARE' or 'HAIR CARE'.");
                }
                break;

            case 6: // SKINCARE Products
                if (text.includes('gluta rosa soap')) {
                    await sendTextMessage(from, "Gluta Rosa soap: https://www.prismosbeauty.com/skin-care/buy-best-glutathione-soap-with-rose-petals-fruit-extracts-product-online");
                } else if (text.includes('pearl soft moisturiser')) {
                    await sendTextMessage(from, "Pearl Soft Moisturiser: https://www.prismosbeauty.com/skin-care/buy-best-pearl-soft-moisturizing-body-lotion-product-online");
                } else if (text.includes('sunscreen')) {
                    await sendTextMessage(from, "Sunscreen: https://www.prismosbeauty.com/skin-care/buy-best-sun-screen-product-online");
                } else if (text.includes('body cleanser')) {
                    await sendTextMessage(from, "Body Cleanser: https://www.prismosbeauty.com/skin-care/buy-best-body-cleanser-product-online");
                } else if (text.includes('age protect cream')) {
                    await sendTextMessage(from, "Age Protect Cream: https://www.prismosbeauty.com/skin-care/buy-best-anti-aging-face-cream-product-online");
                } else if (text.includes('eloemax')) {
                    await sendTextMessage(from, "Eloemax: https://www.prismosbeauty.com/skin-care/buy-best-eloemax-pure-natural-aloe-vera-gel-product-online");
                } else if (text.includes('hydra glow sheet mask')) {
                    await sendTextMessage(from, "Hydra Glow Sheet Mask: https://www.prismosbeauty.com/skin-care/buy-best-hydra-glow-rose-face-mask-product-online");
                } else if (text.includes('anti-acne facewash')) {
                    await sendTextMessage(from, "Anti-Acne Facewash: https://www.prismosbeauty.com/skin-care/buy-best-anti-acne-face-wash-product-online");
                } else if (text.includes('pearl tone facewash')) {
                    await sendTextMessage(from, "Pearl Tone Facewash: https://www.prismosbeauty.com/skin-care/buy-best-pearl-tone-face-wash-online");
                } else if (text.includes('collagen tablets')) {
                    await sendTextMessage(from, "Collagen Tablets: https://www.prismosbeauty.com/skin-care/buy-best-collagen-tablets-product-online");
                } else {
                    await sendTextMessage(from, "Please select a valid SKINCARE product.");
                }
                session.step = 0;
                break;

            case 7: // HAIR CARE Products
                if (text.includes('fallcure hair oil')) {
                    await sendTextMessage(from, "Fallcure Hair Oil: https://www.prismosbeauty.com/hair-care/buy-best-hair-oil-product-online");
                } else if (text.includes('strengthening shampoo')) {
                    await sendTextMessage(from, "Strengthening Shampoo: https://www.prismosbeauty.com/hair-care/buy-best-strengthening-shampoo-product-online");
                } else if (text.includes('strengthening scalp serum')) {
                    await sendTextMessage(from, "Strengthening Scalp Serum: https://www.prismosbeauty.com/hair-care/buy-best-strengthening-hair-serum-product-online");
                } else if (text.includes('anti-dandruff shampoo')) {
                    await sendTextMessage(from, "Anti-Dandruff Shampoo: https://www.prismosbeauty.com/hair-care/buy-best-free-sulphate-anti-dandruff-shampoo-product-online");
                } else {
                    await sendTextMessage(from, "Please select a valid HAIR CARE product.");
                }
                session.step = 0;
                break;

            case 4:
                if (text.includes('order from website')) {
                    await sendTextMessage(from, "Here is the link to the website: www.prismosbeauty.com");
                } else if (text.includes('order on call')) {
                    await sendTextMessage(from, "Call us at: 9160355557 or 9160455557");
                } else {
                    await sendTextMessage(from, "Please select 'Order from website' or 'Order on call'.");
                }
                session.step = 0;
                break;

            case 5:
                if (text.includes('issue regarding an order') || text.includes('product missing') || text.includes('wrong order delivered') || text.includes('mail us the issue')) {
                    await sendTextMessage(from, "Please email us at: support@prismosbeauty.com or talk to our support team.");
                } else {
                    await sendTextMessage(from, "Please select a valid issue option: 'Issue regarding an order', 'Product missing', 'Wrong order delivered', or 'Mail us the issue'.");
                }
                session.step = 0;
                break;

            default:
                await sendTextMessage(from, "Sorry, something went wrong. Please start over.");
                session.step = 0;
                break;
        }
    }

    res.sendStatus(200);
});

async function sendTemplateMessage(to_phonenumber , template) {
    try {
      const response = await axios.post(
        'https://graph.facebook.com/v20.0/303476846182045/messages',
        {
          messaging_product: 'whatsapp',
          to: to_phonenumber,
          type: 'template',
          template: {
            name: template,
            language: {
              code: 'en_US',
            },
          },
        },
        {
          headers: {
            Authorization: 'Bearer EAAGX97hIpZB4BO9wpq57RQkq7XevZA3BUI52JlAuoctbVqmKXO0bFLqT20VPRIf8yOWLh63Uvn1gwnkQAqIdJq6kgraZAeBMBdroPMiHnG23uiA6wuv3yWEhmJcJi7ZBWvLNPhHuPujn38Kjh3QWfivG8DRmQHy6cpoGaK6zxoa4rFJoQv3ZCpGmVN8q8jgYOUDZA7ZC1YZAl1CcZAcz51aLX05fjvDcz',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Message sent:', response.data);
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  }

async function sendTextMessage(to, text) {
    const messageData = {
        messaging_product: 'whatsapp',
        to: to,
        text: { body: text }
    };

    try {
        const response = await axios.post('https://graph.facebook.com/v20.0/303476846182045/messages', messageData, {
            headers: {
                'Authorization': `Bearer EAAGX97hIpZB4BO9wpq57RQkq7XevZA3BUI52JlAuoctbVqmKXO0bFLqT20VPRIf8yOWLh63Uvn1gwnkQAqIdJq6kgraZAeBMBdroPMiHnG23uiA6wuv3yWEhmJcJi7ZBWvLNPhHuPujn38Kjh3QWfivG8DRmQHy6cpoGaK6zxoa4rFJoQv3ZCpGmVN8q8jgYOUDZA7ZC1YZAl1CcZAcz51aLX05fjvDcz`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Text message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending text message:', error.response ? error.response.data : error.message);
    }
}

app.get('/webhook', (req, res) => {
    const challenge = req.query['hub.challenge'];
            console.log('Webhook verified');
            res.status(200).send(challenge);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
