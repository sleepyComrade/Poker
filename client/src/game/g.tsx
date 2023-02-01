import React from "react";
import './pk.css'
/*
<div className="card_img" style={{'--value': 7, '--type': 2}}></div>
            <div className="card_img" style={{'--value': 1, '--type': 2}}></div>*/
export default function Garage() {
    return (
        <div>
            <Table></Table>
            {/* <Card value={7} type={2}></Card> */}
        </div>
    )
}

function Card({value, type}: {value:number, type:number}){
    return (
        <div className='card_wrapper' style={{width:"100%", height: "100%"}}>
            <div className='card_base card_a card_img' style={{'--value': value, '--type': type}}>

            </div>
            <div className='card_base card_b card_img' style={{'--value': 2, '--type': 4}}>
                
            </div>
        </div>
    )
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
            
            <div className='table_wrapper'>
                <div className="table_stack">
                    <div className='table_card ani_card0'>
                        <Card value={7} type={2}></Card>
                    </div>
                    <div className='table_card ani_card1'>
                        <Card value={7} type={2}></Card>
                    </div>
                    <div className='table_card ani_card2'></div>
                    <div className='table_card ani_card3'></div>
                    <div className='table_card ani_card4'></div>
                </div>
            </div>
            <Player place={1} />
            <Player place={2} />
            <Player place={3} />
            <Player place={4} />
            <Player place={5} />
            <Player place={6} />
        </div>
    </div>
}