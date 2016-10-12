'use strict';

//events
const eventConfig = require('./eventConfig'); 
const MyEntityWasCreatedEvent = eventConfig.MyEntityWasCreatedEvent;
const MyEntityWasUpdatedEvent = eventConfig.MyEntityWasUpdatedEvent;

const entityTypeName = eventConfig.entityTypeName;



class EntityClass {
  
  constructor() {
    this.entityTypeName = entityTypeName;
  }

  applyMyEntityWasCreatedEvent(event) {
    console.log('applyMyEntityWasCreatedEvent()');
    return this;
  }

  applyMyEntityWasUpdatedEvent(event) {
    console.log('applyMyEntityWasUpdatedEvent()');
    return this;
  }


  applyEvent(event) {
    const eventType = event.eventType;
  
    switch(eventType) {
      default:
        break;
    }
  
    return this
  }

  processCreateEntityCommand(command) {
    return [
      {
        eventType: MyEntityWasCreatedEvent,
        eventData: {
          timestamp: command.createTimestamp
        }
      }
    ];
  }

  processUpdateEntityCommand(command) {
    return [
      {
        eventType: MyEntityWasUpdatedEvent,
        eventData: {
          timestamp: command.updateTimestamp
        }
      }];
  }

  processCommand(command) {

    switch(command.commandType) {
      case CreateEntityCommand:
  
        return [
          {
            eventType: MyEntityWasCreatedEvent,
            eventData: {
              timestamp: command.createTimestamp
            }
          }
        ];
        break;
  
      case UpdateEntityCommand:
  
        return [
          {
            eventType: MyEntityWasUpdatedEvent,
            eventData: {
              timestamp: command.updateTimestamp
            }
          }];
        break;
  
      default:
        break;
    }
  }



  //commands
  static get CreateEntityCommand() {
    return 'CreateEntityCommand';
  }

  static get UpdateEntityCommand() {
    return 'UpdateEntityCommand';
  }
}


module.exports = EntityClass;