import styled from "styled-components";

export const ProjectsSection = styled.section`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	column-gap: 50px;
	row-gap: 50px;
	margin-bottom: 80px;
	scroll-margin-top: 50px;
	@media (max-width: 768px) {
		display: block;
	}

`

export const ProjectCard = styled.div`
	padding: 25px;
	background-color: #e6e18f;
	box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
	border-radius: 20px;
	min-height: 350px;

	font-weight: bold;

	.project-descr {
		font-size: 16px;
		font-weight: 300;
	}
	// grid-column: 1 / 3;
	// grid-row: 1;
`

export const StyledProjectsSection = styled.section`
	display: flex;
	flex-direction: column;

	h2:before {
		content: "";
		display: inline-block;
		height: 12px;
		width: 12px;
		background-color: #ee5b36;
		margin-right: 10px;
	}

	.project-grid {
		// outline: 1px solid black;
		overflow: hidden;
		list-style: none;
		padding-left: 0px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		grid-gap: 50px;
		position: relative;
		margin-top: 50px;

		@media (max-width: 1080px) {
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		}

		.featured-project {
			// outline: 1px solid black;
			flex-direction: column;
			width: 100%;
			display: flex;
			gap: 15px;
			// overflow: hidden;

			.project-image {
				// outline: 1px solid black;
				// border-radius: 20px;
				overflow: hidden;
			}

			.all-techs-container {
				padding-top: 20px;
				padding-bottom: 20px;

				.single-tech {
					background-color: #add8e6;
					border-radius: 20px;
					padding: 10px;
					padding-left: 15px;
					padding-right: 15px;
				}
			}
		}
}
`;

