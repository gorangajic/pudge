# Pudge

![pudge](http://i.imgur.com/3I2ISik.png)

    npm install pudge --save

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

