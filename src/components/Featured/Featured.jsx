import './Featured.scss';
import { featured } from '../../data';

const Featured = () => {
    return (
    <section className="featured">
            <h1>Play Like A Pro</h1>
        <div className="wrapper">
            {
                featured.map(feature => {
                    return (<div className="item" key={feature.title}>
                        <div className="emoji">{feature.emoji}</div>
                        <h3 >{feature.title}</h3>
                    </div>)
                })
            }
        </div>
    </section>
    );
}
export default Featured;