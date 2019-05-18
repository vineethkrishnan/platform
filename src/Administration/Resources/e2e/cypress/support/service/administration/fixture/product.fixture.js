const AdminFixtureService = require('../fixture.service.js');

export default class ProductFixture extends AdminFixtureService {
    setProductFixture(userData) {
        const findManufacturerId = () => this.search('tax', {
            field: 'name',
            type: 'equals',
            value: '19%'
        });
        const findTaxId = () => this.search('product-manufacturer', {
            field: 'name',
            type: 'equals',
            value: 'shopware AG'
        });


        return Promise.all([findManufacturerId(), findTaxId()])
            .then(([tax, manufacturer]) => {
                return Object.assign({}, {
                    taxId: tax.id,
                    manufacturerId: manufacturer.id
                }, userData);
            }).then((finalProductData) => {
                return this.apiClient.post('/v1/product?_response=true', finalProductData);
            });
    }

    setProductVisible(productId) {
        let salesChannelId = '';
        const startTime = new Date();

        return this.apiClient.post('/v1/search/sales-channel?response=true', {
            filter: [{
                field: 'name',
                type: 'equals',
                value: 'Storefront'
            }]
        }).then((data) => {
            salesChannelId = data.id;
        }).then(() => {
            return this.create('category');
        }).then(() => {
            global.logger.title('Set product visibility...');

            return this.update({
                id: productId,
                type: 'product',
                data: {
                    visibilities: [{
                        visibility: 30,
                        salesChannelId: salesChannelId
                    }]
                }
            });
        })
            .then((data) => {
                const endTime = new Date() - startTime;
                global.logger.success(`Updated product: ${data.id} (${endTime / 1000}s)`);
                global.logger.lineBreak();

                return data.id;
            })
            .catch((err) => {
                global.logger.error(err);
                global.logger.lineBreak();
            });
    }
}

global.ProductFixtureService = new ProductFixture();
