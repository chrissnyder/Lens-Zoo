
{Tutorial}  = require 'zootorial'
{Step}      = require 'zootorial'

module.exports =
  
  createSimulationFoundFeedback: (e, trainingType, x, y) ->
    return new Tutorial
      id: 'simFound'
      firstStep: 'simFound'
      steps:
        length: 1
        
        simFound: new Step
          header: 'Nice catch!'
          details: "You found a simulated #{trainingType}!"
          attachment: "left center .primary #{x} #{y}"
          block: '.annotation'
          className: 'arrow-left'
          nextButton: 'Next image'
          next: true
          onExit: =>
            @submit(e)
            @viewer.trigger 'close'
  
  createSimulationMissedFeedback: (e, trainingType, x, y) ->
    return new Tutorial
      id: 'simMissed'
      firstStep: 'simMissed'
      steps:
        length: 1
        
        simMissed: new Step
          number: 1
          header: 'Whoops!'
          details: "You missed a simulated #{trainingType}!  Don't worry, let's move to the next image."
          attachment: "left center .primary #{x} #{y}"
          block: '.annotation'
          className: 'arrow-left'
          nextButton: 'Next image'
          next: true
          onExit: =>
            @submit(e)
            @viewer.trigger 'close'
  
  createDudFoundFeedback: (e) ->
    return new Tutorial
      id: 'emptyFound'
      firstStep: 'emptyFound'
      steps:
        length: 1
        
        emptyFound: new Step
          header: 'Nice! There is no gravitational lens in this field!'
          details: "This is a different kind of Training Image, one that has already been inspected by the Science Team and found not to contain any gravitational lenses."
          attachment: 'center center .primary center center'
          block: '.annotation'
          nextButton: 'Next image'
          next: true
          onExit: =>
            @submit(e)
            @viewer.trigger 'close'
  
  createDudMissedFeedback: (e) ->
    return new Tutorial
      id: 'empty-missed'
      firstStep: 'missed'
      steps:
        length: 1
        
        missed: new Step
          header: 'There is no gravitational lens in this field!'
          details: "This is a different kind of Training Image, one that has already been inspected by the Science Team and found not to contain any gravitational lenses."
          attachment: 'center center .primary center center'
          block: '.annotation'
          nextButton: 'Next image'
          next: true
          onExit: =>
            @submit(e)
            @viewer.trigger 'close'