# Pudge

[![Build Status](https://semaphoreci.com/api/v1/projects/5bcbf059-07fd-4b8f-afb2-e54537f1fb70/539259/badge.svg)](https://semaphoreci.com/gorangajic/pudge-2)

![pudge](http://i.imgur.com/3I2ISik.png)


### install

```
npm install pudge --save
```


### usage
```javascript

var pudge = require('pudge');

pudge.register('AFTER_HOOKED', function rot(player) {
    console.log('turned rot on');
    return Promise.resolve();
});

pudge.register('AFTER_HOOKED', function dismemberr(player) {
    console.log('eating', player.username);
    return EatPlayer(player);
});



pudge.run('AFTER_HOOK', player).then(function() {
    console.log('ultra kill')
});


// turned rot on
// eating dendi
// ultra kill
```


## API

#### register(hookName, callback)

- register method to be run when hook happend
- callback will receive arguments that are passed in ```run``` or ```parallel```.
- callback should return promise, so it's possible to know when hook is done

```javascript
pudge.register('PUDGE_AWESOME_HOOK', function(arg1, arg2, arg3) {
    // do something when hook is run
    return Promise.resolve();
});
```

#### run(hookName, args...) -> Promise

run registred hooks one after another

```javascript
pudge.run('PUDGE_AWESOME_HOOK', arg1, arg2, arg3, function() {

});
```

#### parallel(hookName, args...) -> Promise

run registred hooks in parallel

```javascript
pudge.parallel('PUDGE_AWESOME_HOOK', arg1, arg2, arg3, function() {

});
```



