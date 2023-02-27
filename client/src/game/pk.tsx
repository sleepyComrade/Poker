import React from 'react';
import './pk.css';

export function Pk(){
    return <div>
        <div className='player'>
            <div className='player_time'>
                <div className='player_ava'>AA</div>
            </div>
            <div className='player_nc_wrapper'>
                <div className='player_name'>Anyj Anykiewicz</div>
                <div className='player_cash'>23 456</div>  
            </div>
        </div>

        <div className='game_scene'>
            <div className='card_stack'>
                <div className='card_wrapper'>
                    <div className='card_base card_a'>

                    </div>
                    <div className='card_base card_b'>
                        
                    </div>
                </div>

                <div className='card_wrapper'>
                    <div className='card_base card_a'>

                    </div>
                    <div className='card_base card_b'>
                        
                    </div>
                </div>

                <div className='card_wrapper'>
                    <div className='card_base card_a'>

                    </div>
                    <div className='card_base card_b'>
                        
                    </div>
                </div>
            </div>

            <div className='card_stack'>
                <div className='hand_zero'>
                    <div className='card_wrapper'>
                        <div className='card_base card_a'>

                        </div>
                        <div className='card_base card_b'>
                            
                        </div>
                    </div>
                </div>
                <div className='hand_zero'>
                    <div className='card_wrapper card_wrapper_second'>
                        <div className='card_base card_a'>

                        </div>
                        <div className='card_base card_b'>
                            
                        </div>
                    </div>    
                </div>
                
            </div>
            <div className='controls_wrapper'>
                <div className='controls_button controls_fold shine'>FOLD</div>
                <div className='controls_button controls_check'>CHECK</div>
                <div className='controls_button controls_raise'>RAISE</div>
            </div>
            <div>
                <div className='table_around'>
                    <div className='table_place tp1'></div>
                    <div className='table_place tp2'></div>
                    <div className='table_place tp3'></div>
                    <div className='table_place tp4'></div>
                    <div className='table_place tp5'></div>
                    <div className='table_place tp6'></div>
                    <div className='table_wrapper'>
                        <div className="table_stack">
                            <div className='table_card'></div>
                            <div className='table_card'></div>
                            <div className='table_card'></div>
                            <div className='table_card'></div>
                            <div className='table_card'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Table></Table>
    </div>
}

function Player({place}: {place: number}){
    return <div className={`abs player tp${place}`}>
    <div className='player_time'>
        <div className='player_ava'>AA</div>
        </div>
        <div className='player_nc_wrapper'>
            <div className='player_name'>Anyj Anykiewicz</div>
            <div className='player_cash'>23 456</div>  
        </div>
    </div>
}

function Table(){
    return <div>
        <div className='table_around'>
            <Player place={1} />
            <Player place={2} />
            <Player place={3} />
            <Player place={4} />
            <Player place={5} />
            <Player place={6} />
            <div className='table_wrapper'>
                <div className="table_stack">
                    <div className='table_card ani_card0'></div>
                    <div className='table_card ani_card1'></div>
                    <div className='table_card ani_card2'></div>
                    <div className='table_card ani_card3'></div>
                    <div className='table_card ani_card4'></div>
                </div>
            </div>
        </div>
    </div>
}

function AniTest(){
    return (
        <div className='door_wrapper'>
            {new Array(10).fill(null).map((_, i)=>{
                return (
                    <div className='door_item' style={{transform: `rotate(${360/10 *i}deg) translate(${80}px, ${0}px)`}}></div>
                )
            })}
        </div>
    )
}