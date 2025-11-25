class HeroBasics {
    static state = {
        currentState: 'Idle',
        isAlive: true,
        level: 1,   //等级

        health: 5,
        maxHealth: 5,
        revertHealth: 0,

        mana: 10,      //法力值
        maxMana: 10,   //最大法力值
        revertMana: 0, //法力恢复

        damage: 2.2, //攻击力
        attackSpeed: 3.0,//攻击速度

        experience: 0, //当前经验
        experienceScope: 2, //吸附范围

        buff: [],
        debuff: [],

        skill: ["NormalBullet"],

        equip: ["Doran", "", "", "", "", ""],

        power: 0,            //法强
        armor: 0,            //护甲
        magic_resistance: 0, //魔抗
        cooldown: 0,          //冷却
        criticalStrike: 0,     //暴击率
        movementSpeed: 6.8,     //移动速度

    };

    constructor() {
        this.state = HeroBasics.state;
    }
}
export default HeroBasics;
