import React from 'react'

export default function PublicFooter() {
    const year = new Date().getFullYear()

    return (
        <footer>
            <div className="bb ze ki xn 2xl:ud-px-0">
                {/* Footer Bottom */}
                <div className="bh ch pm tc uf sf yo wf xf ap cg fp bj">
                    <div className="animate_top">
                        <ul className="tc wf gg">
                            {/* <li><a href="#!" className="xl">English</a></li> */}
                            <li><a href="#!" className="xl">Kebijakan Privasi</a></li>
                            <li><a href="#!" className="xl">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>

                    <div className="animate_top">
                        <p>
                            &copy; {year} SIPJAKI. All rights reserved. Distributed by Dinas Bina Marga dan Bina Konstruksi Kabupaten Pasuruan
                        </p>
                    </div>
                </div>
                {/* Footer Bottom */}
            </div>
        </footer>
    )
}