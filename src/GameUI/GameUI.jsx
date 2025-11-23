import React, { useState, useEffect } from 'react';
import "./gameUI.css";
import { useGameStore } from '../Store/StoreManage';
import Attack_damage_icon from '/icon/Attack_damage_icon.png'
import Ability_power_icon from '/icon/Ability_power_icon.png'
import Armor_icon from '/icon/Armor_icon.png'
import Attack_speed_icon from '/icon/Attack_speed_icon.png'
import Critical_strike_chance_icon from '/icon/Critical_strike_chance_icon.png'
import Magic_resistance_icon from '/icon/Magic_resistance_icon.png'
import Movement_speed_icon from '/icon/Movement_speed_icon.png'
import Cooldown_icon from '/icon/Cooldown_icon.png'
import Caitlyn_PulsefireCircle from '/icon/Caitlyn_PulsefireCircle.png'
const GameUI = () => {
    // useGameStore.getState()?.HeroManage?.state
    const [stats, setStats] = useState({
        damage: { value: 249, icon: Attack_damage_icon },
        power: { value: 0, icon: Ability_power_icon },
        armor: { value: 106, icon: Armor_icon },
        magic_resistance: { value: 106, icon: Magic_resistance_icon },
        attackSpeed: { value: 0.91, icon: Attack_speed_icon },
        cooldown: { value: 15, icon: Cooldown_icon },
        criticalStrike: { value: 25, icon: Critical_strike_chance_icon },
        movementSpeed: { value: 233, icon: Movement_speed_icon },
    })

    useEffect(() => {
    }, []);

    return (
        <>
            <div className='bottomUIBox'>
                {/* 左侧属性栏 */}
                <div className='leftStateBox'>
                    {
                        Object.keys(stats).map(key => {
                            const item = stats[key];
                            return (
                                <div key={key} className='leftStateBoxItem'>
                                    <img src={item.icon} alt={key} />
                                    <span>{item.value}</span>
                                </div>
                            );
                        })
                    }
                </div>

                {/* 头像区域 */}
                <div className='HeadBox'>
                    <img src={Caitlyn_PulsefireCircle} alt="" />
                </div>

                {/* 主要血量区域 */}
                <div className='mainBox'>
                    <div className='skillBox'>
                        <div className='skillItem minSkillItem'>

                        </div>
                        <div className='skillItem'>
                            <div className='icon'></div>
                            <div className='magic'>20</div>
                            <div className='key'>Q</div>
                            <div className='levelBox'>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                        <div className='skillItem'><div className='icon'></div>
                            <div className='magic'>20</div>
                            <div className='key'>W</div>
                            <div className='levelBox'>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div></div>
                        <div className='skillItem'><div className='icon'></div>
                            <div className='magic'>20</div>
                            <div className='key'>E</div>
                            <div className='levelBox'>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div></div>
                        <div className='skillItem'><div className='icon'></div>
                            <div className='magic'>20</div>
                            <div className='key'>R</div>
                            <div className='levelBox'>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div></div>
                        <div className='skillItem minSkillItem'></div>
                        <div className='skillItem minSkillItem'></div>
                    </div>

                    <div className='helathBarBox'>
                        <div className='helathBarItem'>
                            <div className='healthBar'></div>
                            <span className='healthBarNumber'>2040 / 2374</span>
                            <span className='healthBarAdd'>+ 1.4</span>
                        </div>
                        <div className='helathBarItem'>
                            <div className='magicBar'></div>
                            <span className='healthBarNumber'>1041 / 1041</span>
                            <span className='healthBarAdd'>+ 1.4</span>
                        </div>
                    </div>

                    {/* buff栏 */}
                    <div className='buffBox'>
                        <div className='selfBuffBox'>
                            <div className='buffIcon'></div>
                            <div className='buffIcon'></div>
                            <div className='buffIcon'></div>
                            <div className='buffIcon'></div>
                        </div>
                        <div className='deBuffBox'>
                            <div className='buffIcon'></div>
                            <div className='buffIcon'></div>
                        </div>

                    </div>
                </div>

                {/* 装备 */}
                <div className='equipBox'>
                    <div className='equipInLeftBox'>
                        <div className='equipInBox'>
                            <div className='equipItem'></div>
                            <div className='equipItem'></div>
                            <div className='equipItem'></div>
                            <div className='equipItem'></div>
                            <div className='equipItem'></div>
                            <div className='equipItem'></div>
                        </div>
                        <div className='BuyBtn'>
                            Buy
                        </div>
                    </div>

                    <div className='equipInRightBox'>
                        <div className='eyeBtn'></div>
                        <div className='backBtn'></div>
                        <div className='shop'></div>
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