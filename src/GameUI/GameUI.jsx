import React, { useState, useEffect, useRef } from 'react';
import "./css/gameUI.css";
import { useGameStore } from '../Store/StoreManage';
import CircularProgressAvatar from './Component/CircularProgressAvatar'
import { Icon, HeroIcon, SkillIcon, equipIcon } from './Component/Icon'
const GameUI = () => {
    const [stats, setStats] = useState({ ...useGameStore.getState().HeroManage?.state })

    const heroSkillIcon = useRef({
        Passive: { icon: SkillIcon.Caitlyn_Headshot },
        Q: { icon: SkillIcon.Caitlyn_Piltover_Peacemaker, level: 5, magic: 20 },
        W: { icon: SkillIcon.Caitlyn_Yordle_Snap_Trap, level: 5, magic: 40 },
        E: { icon: SkillIcon.Caitlyn_90_Caliber_Net, level: 5, magic: 40 },
        R: { icon: SkillIcon.Caitlyn_Headshot, level: 5, magic: 100 },
        D: { icon: SkillIcon.Flash },
        F: { icon: SkillIcon.Heal },
    })

    const leftRenderKey = useRef([
        "damage",
        "power",
        "armor",
        "magic_resistance",
        "attackSpeed",
        "cooldown",
        "criticalStrike",
        "movementSpeed"
    ]);

    const healthPercentage = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100))

    useEffect(() => {
        const gameStore = useGameStore.getState();
        const intervalId = setInterval(() => {
            const heroState = gameStore.HeroManage?.state;
            if (heroState) {
                setStats(prevStats => {
                    const newStats = { ...heroState };
                    if (JSON.stringify(prevStats) === JSON.stringify(newStats)) {
                        return prevStats;
                    }
                    return newStats;
                });
            }
        }, 500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <div className='bottomUIBox'>

                <div className='heroLevelBox'>
                    {stats.level}
                </div>

                {/* 左侧属性栏 */}
                <div className='leftStateBox'>
                    {
                        Object.keys(stats).map(key => {
                            if (leftRenderKey.current.includes(key)) {
                                const item = stats[key];
                                const icon = Icon[key];
                                return (
                                    <div key={key} className='leftStateBoxItem'>
                                        <img src={icon} alt={key} />
                                        <span>{item}</span>
                                    </div>
                                );
                            }

                        })
                    }
                </div>

                {/* 头像以及经验条 */}
                <CircularProgressAvatar
                    avatar={HeroIcon.Caitlyn_PulsefireCircle}
                    progress={(stats.experience / 10) * 100}
                    size={120}
                    strokeWidth={12}
                />

                {/* 中间区域 */}
                <div className='mainBox'>

                    {/* 技能 */}
                    <div className='skillBox'>

                        {
                            Object.keys(heroSkillIcon.current).map(key => {
                                if (['Passive', 'D', 'F'].includes(key)) {

                                    return (<div key={key} className='skillItem minSkillItem'>
                                        <img src={heroSkillIcon.current[key].icon} alt="" />
                                    </div>)
                                } else {
                                    return (
                                        <div className='skillItem' key={key}>

                                            <img src={heroSkillIcon.current[key].icon} alt="" />
                                            <div className='magic'>{heroSkillIcon.current[key].magic}</div>
                                            <div className='key'>{key}</div>
                                            <div className='levelBox'>
                                                {Array.from({ length: heroSkillIcon.current[key].level }, (_, index) => (
                                                    <div key={index} className='levelDot'></div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>

                    {/* 血条 */}
                    <div className='helathBarBox'>
                        <div className='helathBarItem'>
                            <div className='healthBar' style={{ width: `${healthPercentage}%` }}></div>
                            <span className='healthBarNumber'>{stats.health} / {stats.maxHealth}</span>
                            <span className='healthBarAdd'>+ {stats.revertHealth}</span>
                        </div>
                        <div className='helathBarItem'>
                            <div className='magicBar'></div>
                            <span className='healthBarNumber'>{stats.mana} / {stats.maxMana}</span>
                            <span className='healthBarAdd'>+ {stats.revertMana}</span>
                        </div>
                    </div>

                    {/* buff栏 */}
                    <div className='buffBox'>

                        <div className='selfBuffBox'>
                            {stats.buff.map(item => {
                                return (
                                    <div key={item} className='buffIcon'></div>
                                )
                            })}
                        </div>
                        <div className='deBuffBox'>
                            {stats.debuff.map(item => {
                                return (
                                    <div key={item} className='buffIcon'></div>
                                )
                            })}
                        </div>

                    </div>
                </div>

                {/* 装备 */}
                <div className='equipBox' onClick={() => { useGameStore.getState().MonsterManage.addMonsters("rangedMonster") }}>
                    <div className='equipInLeftBox'>
                        <div className='equipInBox'>
                            {
                                stats.equip.map((item, key) => {
                                    return (
                                        <div className='equipItem' key={key}>
                                            {item !== "" && <img src={equipIcon[item]} alt="" />}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className='BuyBtn'>
                            Buy
                        </div>
                    </div>
                </div>
            </div>

            {/* 右上角的设置栏 */}
            <div className='settingBox'>
                <span>FPS:123</span>
            </div>
        </>
    );
};

export default GameUI;