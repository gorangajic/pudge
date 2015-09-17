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
