Game engine doesn't need to have a card database inside its config. That is way too big of an object for just the engine.

- this should be moved out to a card service with getters (I think the card manager does something similar?)

I recently made the SynthesisService a singleton, that was a mistake. That should defnitely just be a group of helper methods in a class and let the card manager or something else handle stateful management of card data

ActionProcessor not a sub-part of stateManager?

effectRegistry, stackManager, triggerDetector, requirementValidator
Where are the boundaries between what the gameEngine handles and what the stateManager handles?

EffectTypeRegistry is a singleton. Hmm, maybe.

see a lot of these managers require state manager and card manager as parameters, that's a good indication there might be some nesting issues

the action processor needs HOW MANY PARAMETERS???

TheEffectTypeRegistry also has execution, validation and targeting logic defined in it....

Jesus Christ I don't even know what's savable at this point

