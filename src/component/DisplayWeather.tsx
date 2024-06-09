import React, { ReactNode, useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { WiHumidity } from "react-icons/wi";
import { GiWhirlwind } from "react-icons/gi";
import { RiLoaderFill } from "react-icons/ri";
import axios from "axios";
import { BsFillSunFill, BsFillCloudRainFill, BsCloudyFill, BsCloudFog2Fill } from "react-icons/bs";
import { TiWeatherPartlySunny } from "react-icons/ti";
import moment from "moment-timezone";
import tzlookup from 'tz-lookup';
import styled from "styled-components";
import { MdOutlineDarkMode } from "react-icons/md";

import { MainWrapper } from "./styles.module";

interface WeatherDataProps {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  sys: {
    country: string;
  };
  weather: {
    main: string;
  }[];
  wind: {
    speed: number;
  };
  coord: {
    lon: number;
    lat: number;
  };
}

const DisplayWeather = () => {
  const api_key = "c7b3e42d5e5f8fee1df04438e737628d";
  const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

  const [weatherData, setWeatherData] = useState<WeatherDataProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState(moment.tz.guess());
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const fetchCurrentWeather = async (lat: number, lon: number) => {
    try {
      const url = `${api_Endpoint}weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching weather data: ", error);
    }
  };

  const fetchWeatherData = async (city: string) => {
    try {
      const url = `${api_Endpoint}weather?q=${city}&appid=${api_key}&units=metric`;
      const searchResponse = await axios.get(url);
      const currentWeatherData: WeatherDataProps = searchResponse.data;
      return currentWeatherData;
    } catch (error) {
      console.error("No data found", error);
      throw error;
    }
  };

  const handleSearch = async () => {
    if (searchCity.trim() === "") {
      return;
    }
    setIsLoading(true);
    try {
      const currentWeatherData = await fetchWeatherData(searchCity);
      setWeatherData(currentWeatherData);
      setIsLoading(false);
      const { lon, lat } = currentWeatherData.coord;
      const tz = tzlookup(lat, lon);
      setTimeZone(tz);
    } catch (error) {
      console.error("No result found", error);
      setIsLoading(false);
    }
  };

  const iconChanger = (weather: string) => {
    let iconElement: ReactNode;
    let iconColor: string;

    switch (weather) {
      case "Rain":
        iconElement = <BsFillCloudRainFill />;
        iconColor = "#272829";
        break;
      case "Clear":
        iconElement = <BsFillSunFill />;
        iconColor = "#FFC436";
        break;
      case "Clouds":
        iconElement = <BsCloudyFill />;
        iconColor = "#102C57";
        break;
      case "Haze":
        iconElement = <BsCloudFog2Fill />;
        iconColor = "#279EFF";
        break;
      default:
        iconElement = <TiWeatherPartlySunny />;
        iconColor = "#7B2869";
        break;
    }

    return (
      <span className="icon" style={{ color: iconColor }}>
        {iconElement}
      </span>
    );
  };

  const formatDateTime = (date: Date, timeZone: string) => {
    return moment(date).tz(timeZone).format("dddd, MMMM Do YYYY, h:mm:ss A");
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchCurrentWeather(latitude, longitude).then((currentWeather) => {
          setWeatherData(currentWeather);
          setIsLoading(false);
          const tz = tzlookup(latitude, longitude);
          setTimeZone(tz);
        });
      },
      (error) => {
        console.error("Error getting geolocation: ", error);
        setIsLoading(false);
      }
    );

    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MainWrapper >
      <div className="container">
      <div className={`App ${theme}`}> 
        <div className="dateTime">
          {formatDateTime(dateTime, timeZone)}
          {/* <button onClick={toggleTheme}><MdOutlineDarkMode onClick={toggleTheme} /></button> */}
          {/* <MdOutlineDarkMode onClick={toggleTheme} /> */}
        </div>
        {/* <MdOutlineDarkMode onClick={toggleTheme} /> */}
        <h3><MdOutlineDarkMode onClick={toggleTheme} /></h3>
        <div className="searchArea">
          <input
            type="text"
            placeholder="Enter City Name"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <div className="searchCircle">
            <AiOutlineSearch className="searchIcon" onClick={handleSearch} />
          </div>
        </div>
        {isLoading ? (
          <div className="loading">
            <RiLoaderFill className="loadingIcon" />
          </div>
        ) : weatherData ? (
          <>
            <div className="weatherArea">
              <div className="weatherTitle">
                <h1>{weatherData.name}</h1>
              </div>
              <div className="weathercountry">
                <span>{weatherData.sys.country}</span>
              </div>

              <div className="icon">
                {iconChanger(weatherData.weather[0].main)}
              </div>
              <h1>{weatherData.main.temp}°C</h1>
              <h2>{weatherData.weather[0].main}</h2>
            </div>
            
              <div className="humiditylevel">
                <WiHumidity className="windIcon" />
                <div className="humidInfo">
                  <h1>{weatherData.main.humidity}%</h1>
                  <p>Humidity</p>
                </div>
              </div>
              <div className="wind">
                <GiWhirlwind className="windIcon" />
                <div className="humidInfo">
                  <h1>{weatherData.wind.speed} km/hr</h1>
                  <p>Wind Speed</p>
                </div>
              </div>
            
          </>
        ) : (
          <div className="noData">No weather data available</div>
        )}
      </div>
    </div>
    </MainWrapper>
  );
};

export default DisplayWeather;