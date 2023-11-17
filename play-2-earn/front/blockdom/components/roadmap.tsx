import React from 'react'

export default function Roadmap() {

    const steps = [
        {
            stepNum: 1,
            title: "Luanch",
            description: "Something"
            },
        {
            stepNum: 2,
            title: "Community",
            description: "Something else"
            },
            {
                stepNum: 3,
                title: "Community",
                description: "Something else"
                },
                {
                    stepNum: 4,
                    title: "Community",
                    description: "Something else"
                    },
                    {
                        stepNum: 5,
                        title: "Community",
                        description: "Something else"
                        },
    
    ] as const

  return (
    <>
    <div className='h-1 w-full  absolute mt-[20rem] bg-gradient-to-r from-black via-gray-500 '>
    </div>
    <div className='relative flex items-center justify-around px-[10rem]'>
    {steps.map((step => (
            <div className={` mt-[20rem] -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#131D17] to-[#21442F]  rounded-xl`}>

            </div>
         
    )))}
   </div>
    </>
  )
}
