import './Testimonials.scss'
import { testimonials } from '../../data'

export default function Testimonials() {
    return (
    <div className='testimonials'>
    <div className="wrapper">
        {
            testimonials.map(testimonial => {
                return (
                    <div className='testimonial' key={testimonial.id}>
                        <div className='content'>
                            <h1 >_{testimonial.title}</h1>
                            <p>
                                {testimonial.description}
                            </p>
                        </div>
                        <h2 id='name'>{testimonial.name}</h2>
                    </div>
                )
            })
        }
    </div>
    </div>
  )
}
