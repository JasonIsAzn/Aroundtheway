import styles from './Body.module.css';
import styless from './Footer.module.css';

function Footer()
{
    return (
        <div className={styles.footerContainer}>
            <ul className={styless.footer}>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">SOCIAL</a></li>
                <li><a href="#">TIMELINE</a></li>
            </ul>
            <a href="#">©2025 AROUNDTHEWAY®</a>
        </div>
    );
}
export default Footer;