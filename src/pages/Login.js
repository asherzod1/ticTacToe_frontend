import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message} from 'antd';
import {Link, useNavigate} from "react-router-dom";

function Login({socket}) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const onFinish = (values) => {
        setLoading(true)
        socket.emit("login",values)
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const user = localStorage.getItem("userTicTac") ? JSON.parse(localStorage.getItem("userTicTac")).id : null
    useEffect(()=>{
        if(user){
            navigate("/")
        }
    },[])

    useEffect(()=>{
        socket.on("login",(data)=>{
            console.log(data)
            if(data){
                localStorage.setItem("userTicTac",JSON.stringify(data))
                message.success("You are loged in")
                setLoading(false)
                navigate("/")
            }
        })
    },[socket])

    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
            <div>
                <h3 className="mb-4 text-center">Enter your name</h3>
                <Form
                    name="basic"
                    layout="vertical"
                    labelCol={{
                        span: 24,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        placeholder={"Your name"}
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Name!',
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        // wrapperCol={{
                        //     offset: 16,
                        //     span: 16,
                        // }}
                    >
                        <Button loading={loading} style={{width: '100%'}} type="primary" htmlType="submit">
                            Enter
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default Login;
