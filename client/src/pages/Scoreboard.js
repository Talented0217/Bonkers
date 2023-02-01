import { useState, useEffect } from "react";
const Scoreboard = () => {
    
    const fetchScoreData = async () =>{

    }
    useEffect(()=>{
        
    },[])
    return (<>
    <div id="score-board" className="w-3/4 md:w-2/3 lg:w-1/2 m-auto py-20">
    
        <div className="rounded-[50px] bg-[#361728cc] p-10">
            <div id="score-title" className="text-center text-[32px] md:text-[40px] sm:text-[50px] text-orange-300 my-5">
                Score Board
            </div>            
            
            <div>
                <table className="w-full text-center">
                    <thead className="sm:text-[26px] text-[16px] text-[#b5eeff] border-b">
                        <tr>
                            <th >Rank</th>
                            <th >Name</th>
                            <th >Score</th>
                        </tr>
                    </thead>
                    <tbody className="text-[22px] text-[#128921] sm:text-[36px] md:text-[40px] lg:text-[48px]">
                        <tr className="text-[#7fff00]">
                            <td>1</td>
                            <td>ANS</td>
                            <td>167882</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>ANS</td>
                            <td>167882</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>PLH</td>
                            <td>167882</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    </>);
}
export default Scoreboard;