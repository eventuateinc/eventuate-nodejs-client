import 'babel-polyfill';
import util from 'util';
import async from 'async';

import EsClient from './EsClient';
import { getLogger } from './logger';

const defaultLogger = getLogger({ title: 'WorkflowEvents' });

export default class SwimlaneDispatcher {

  constructor({ subscriptions = [], swimlane, executor, apiKey = {}, logger = null, getEventHandler } = {}) {

    if (!logger) {
      logger = defaultLogger;
    }

    Object.assign(this, { subscriptions, swimlane, executor, logger });

    this.createEsClientInstance(apiKey);
  }

  createEsClientInstance(apiKey) {
    if (!apiKey.id) {
      apiKey.id = process.env.EVENTUATE_API_KEY_ID || process.env.EVENT_STORE_USER_ID;
    }

    if (!apiKey.secret) {
      apiKey.secret = process.env.EVENTUATE_API_KEY_SECRET || process.env.EVENT_STORE_PASSWORD;
    }

    if (!apiKey.id || !apiKey.secret) {
      throw new Error('Use `EVENTUATE_API_KEY_ID` and `EVENTUATE_API_KEY_SECRET` to set Event Store auth data');
    }

    let esClientOpts = {
      apiKey: apiKey,
      httpKeepAlive: true,
      spaceName: process.env.EVENTUATE_SPACE_NAME || process.env.EVENT_STORE_SPACE_NAME
    };

    this.esClient = new EsClient(esClientOpts);
  }

  startWorkflow(callback) {

    this.logger.info('Subscribe to: ', util.inspect(this.subscriptions, false, 10));

    if (!this.subscriptions.length) {
      return callback(new Error('The subscriptions array can not be empty'))
    }

    let functions = [];

    this.subscriptions.forEach(({subscriberId, entityTypesAndEvents}) => {

      const logger = this.logger;

      let receipts = [];

      functions.push(cb => {
        const subscribe = this.esClient.subscribe(subscriberId, entityTypesAndEvents, (err, receiptId) => {

          if (err) {
            logger.error('subscribe callback error', err);
            cb(err);
            return;
          }

          logger.info(`The subscription has been established receipt-id: ${receiptId}`);

          if (receipts.indexOf(receiptId) < 0) {
            receipts.push(receiptId);
            cb(null, receiptId);
          }

        });

        this.runProcessEvents(subscribe);

      });
    });

    async.parallel(functions, callback);
  }

  runProcessEvents(subscription) {

    subscription.observable
      .map(createObservable.call(this, this.getEventHandler))
      .merge(1)
      .subscribe(
      ack => {
        if (ack) {
          this.logger.debug('acknowledge: ', ack);
          subscription.acknowledge(ack);
        }
      },
      err => this.logger.error('Subscribe Error', err),
      () => this.logger.debug('Disconnected!')
    );
  }
}

function createObservable(getEventHandler) {

  return event => Rx.Observable.create(observer => {

    


  });

}