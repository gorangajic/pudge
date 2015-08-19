# Pudge

> simple node.js hook utility


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

